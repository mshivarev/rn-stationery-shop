import { useEffect, useId } from 'react';
import * as ScreenCapture from 'expo-screen-capture';

export function usePreventScreenshots() {
  const key = useId();

  useEffect(() => {
    let active = true;
    let prevented = false;

    ScreenCapture.isAvailableAsync()
      .then(async (available) => {
        if (!available || !active) return;
        await ScreenCapture.preventScreenCaptureAsync(key);
        prevented = true;
        if (!active) await ScreenCapture.allowScreenCaptureAsync(key);
      })
      .catch(() => {});

    return () => {
      active = false;
      if (prevented) ScreenCapture.allowScreenCaptureAsync(key).catch(() => {});
    };
  }, [key]);
}
