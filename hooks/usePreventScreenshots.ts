import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';

const KEY = 'auth-screen';

export function usePreventScreenshots() {
  useEffect(() => {
    let active = true;
    let prevented = false;

    ScreenCapture.isAvailableAsync()
      .then(async (available) => {
        if (!available || !active) return;
        await ScreenCapture.preventScreenCaptureAsync(KEY);
        prevented = true;
        if (!active) await ScreenCapture.allowScreenCaptureAsync(KEY);
      })
      .catch(() => {});

    return () => {
      active = false;
      if (prevented) ScreenCapture.allowScreenCaptureAsync(KEY).catch(() => {});
    };
  }, []);
}
