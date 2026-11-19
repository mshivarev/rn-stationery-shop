import hashlib
import hmac
import os
import re
import secrets
import smtplib
import sqlite3
import time
from contextlib import closing
from email.message import EmailMessage

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DB_PATH = os.environ.get("DB_PATH", "auth.sqlite3")
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.mail.ru")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

CODE_TTL = 10 * 60
RESEND_DELAY = 60
MAX_ATTEMPTS = 5
MIN_PASSWORD_LENGTH = 6
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


class RegisterBody(BaseModel):
    email: str
    password: str


class EmailBody(BaseModel):
    email: str


class VerifyBody(BaseModel):
    email: str
    code: str


class LoginBody(BaseModel):
    email: str
    password: str


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(db()) as conn, conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS pending (
                email TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                code_hash TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                sent_at INTEGER NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            """
        )


init_db()


def normalize_email(email: str) -> str:
    email = email.strip().lower()
    if not EMAIL_RE.match(email) or len(email) > 254:
        raise HTTPException(400, "Некорректный email")
    return email


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}${digest.hex()}"


def check_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split("$")
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
    return hmac.compare_digest(digest.hex(), digest_hex)


def hash_code(email: str, code: str) -> str:
    return hashlib.sha256(f"{email}:{code}".encode()).hexdigest()


def new_session(conn: sqlite3.Connection, email: str) -> str:
    token = secrets.token_urlsafe(32)
    conn.execute(
        "INSERT INTO sessions (token_hash, email, created_at) VALUES (?, ?, ?)",
        (hashlib.sha256(token.encode()).hexdigest(), email, int(time.time())),
    )
    return token


def send_code(email: str, code: str) -> None:
    if not SMTP_USER or not SMTP_PASSWORD:
        raise HTTPException(503, "Отправка писем не настроена")
    msg = EmailMessage()
    msg["Subject"] = f"Код подтверждения: {code}"
    msg["From"] = f"Аптека <{SMTP_USER}>"
    msg["To"] = email
    msg.set_content(
        f"Ваш код подтверждения регистрации: {code}\n\n"
        f"Код действует {CODE_TTL // 60} минут.\n"
        "Если вы не регистрировались, просто проигнорируйте это письмо."
    )
    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(msg)
    except (smtplib.SMTPException, OSError):
        raise HTTPException(502, "Не удалось отправить письмо, попробуйте позже")


def issue_code(conn: sqlite3.Connection, email: str, password_hash: str) -> None:
    now = int(time.time())
    row = conn.execute("SELECT sent_at FROM pending WHERE email = ?", (email,)).fetchone()
    if row and now - row["sent_at"] < RESEND_DELAY:
        wait = RESEND_DELAY - (now - row["sent_at"])
        raise HTTPException(429, f"Повторно отправить код можно через {wait} с")
    code = f"{secrets.randbelow(1_000_000):06d}"
    send_code(email, code)
    conn.execute(
        """
        INSERT INTO pending (email, password_hash, code_hash, expires_at, sent_at, attempts)
        VALUES (?, ?, ?, ?, ?, 0)
        ON CONFLICT(email) DO UPDATE SET
            password_hash = excluded.password_hash,
            code_hash = excluded.code_hash,
            expires_at = excluded.expires_at,
            sent_at = excluded.sent_at,
            attempts = 0
        """,
        (email, password_hash, hash_code(email, code), now + CODE_TTL, now),
    )


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/auth/register")
def register(body: RegisterBody):
    email = normalize_email(body.email)
    if len(body.password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(400, f"Пароль должен быть не короче {MIN_PASSWORD_LENGTH} символов")
    with closing(db()) as conn, conn:
        if conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
            raise HTTPException(409, "Пользователь с таким email уже зарегистрирован")
        issue_code(conn, email, hash_password(body.password))
    return {"email": email, "resendAfter": RESEND_DELAY}


@app.post("/auth/resend")
def resend(body: EmailBody):
    email = normalize_email(body.email)
    with closing(db()) as conn, conn:
        row = conn.execute("SELECT password_hash FROM pending WHERE email = ?", (email,)).fetchone()
        if not row:
            raise HTTPException(404, "Сначала зарегистрируйтесь")
        issue_code(conn, email, row["password_hash"])
    return {"email": email, "resendAfter": RESEND_DELAY}


@app.post("/auth/verify")
def verify(body: VerifyBody):
    email = normalize_email(body.email)
    code = body.code.strip()
    with closing(db()) as conn, conn:
        row = conn.execute("SELECT * FROM pending WHERE email = ?", (email,)).fetchone()
        if not row:
            raise HTTPException(404, "Код не запрашивался или уже использован")
        if row["expires_at"] < time.time():
            raise HTTPException(410, "Срок действия кода истёк, запросите новый")
        if row["attempts"] >= MAX_ATTEMPTS:
            raise HTTPException(429, "Слишком много попыток, запросите новый код")
        if not hmac.compare_digest(row["code_hash"], hash_code(email, code)):
            conn.execute("UPDATE pending SET attempts = attempts + 1 WHERE email = ?", (email,))
            left = MAX_ATTEMPTS - row["attempts"] - 1
            raise HTTPException(400, f"Неверный код, осталось попыток: {left}")
        conn.execute(
            "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
            (email, row["password_hash"], int(time.time())),
        )
        conn.execute("DELETE FROM pending WHERE email = ?", (email,))
        token = new_session(conn, email)
    return {"email": email, "token": token}


@app.post("/auth/login")
def login(body: LoginBody):
    email = normalize_email(body.email)
    with closing(db()) as conn, conn:
        row = conn.execute("SELECT password_hash FROM users WHERE email = ?", (email,)).fetchone()
        if not row or not check_password(body.password, row["password_hash"]):
            raise HTTPException(401, "Неверный логин или пароль")
        token = new_session(conn, email)
    return {"email": email, "token": token}
