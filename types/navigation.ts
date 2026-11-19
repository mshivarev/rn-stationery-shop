// Типы для навигации
export type RootStackParamList = {
  DrugList: undefined;
  DrugDetails: { drugId: string };
  Order: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string; resendAfter: number };
};
