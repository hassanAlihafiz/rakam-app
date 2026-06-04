import { I18n } from 'i18n-js';
import { useCallback, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import * as RNLocalize from 'react-native-localize';

import ar from '../../locales/ar.json';
import en from '../../locales/en.json';

export const supportedLocales = ['en', 'ar'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export type TranslationKey = keyof typeof en;

const i18n = new I18n({ en, ar });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

function detectLocale(): SupportedLocale {
  const best = RNLocalize.findBestLanguageTag([...supportedLocales]);
  const tag = best?.languageTag ?? 'en';
  return tag.startsWith('ar') ? 'ar' : 'en';
}

function applyRTL(rtl: boolean): void {
  I18nManager.allowRTL(rtl);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.forceRTL(rtl);
  }
}

const initialLocale = detectLocale();
i18n.locale = initialLocale;
applyRTL(initialLocale === 'ar');

export let currentLocale: SupportedLocale = initialLocale;
export let isRTL = initialLocale === 'ar';

export function setLocale(locale: SupportedLocale): void {
  i18n.locale = locale;
  currentLocale = locale;
  isRTL = locale === 'ar';
  applyRTL(isRTL);
}

export function t(
  key: TranslationKey,
  options?: Record<string, unknown>,
): string {
  return i18n.t(key, options);
}

export function useTranslation() {
  const [version, setVersion] = useState(i18n.version);

  useEffect(() => {
    return i18n.onChange(() => setVersion(i18n.version));
  }, []);

  const translate = useCallback(
    (key: TranslationKey, options?: Record<string, unknown>) =>
      i18n.t(key, options),
    [version],
  );

  const locale = i18n.locale as SupportedLocale;

  return {
    t: translate,
    locale,
    isRTL: locale === 'ar',
  };
}

export { i18n };
