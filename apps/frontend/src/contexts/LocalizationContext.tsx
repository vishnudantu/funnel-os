import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocalizationContextType {
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  locale: string;
  region: string;
  setLocalization: (settings: Partial<LocalizationContextType>) => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const currencyToLocale: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  JPY: 'ja-JP',
  AUD: 'en-AU',
  CAD: 'en-CA',
  SGD: 'en-SG',
  AED: 'ar-AE',
  BRL: 'pt-BR',
  CNY: 'zh-CN',
  CHF: 'de-CH',
  KRW: 'ko-KR',
  MXN: 'es-MX',
  RUB: 'ru-RU',
  ZAR: 'en-ZA',
};

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [numberFormat, setNumberFormat] = useState('en-US');
  const [region, setRegion] = useState('US');

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('saleduct_localization');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrency(parsed.currency || 'USD');
        setDateFormat(parsed.dateFormat || 'MM/DD/YYYY');
        setTimeFormat(parsed.timeFormat || '12h');
        setNumberFormat(parsed.numberFormat || 'en-US');
        setRegion(parsed.region || 'US');
      } catch {}
    }
  }, []);

  const setLocalization = (settings: Partial<LocalizationContextType>) => {
    const newSettings = {
      currency: settings.currency || currency,
      dateFormat: settings.dateFormat || dateFormat,
      timeFormat: settings.timeFormat || timeFormat,
      numberFormat: settings.numberFormat || numberFormat,
      region: settings.region || region,
    };

    setCurrency(newSettings.currency);
    setDateFormat(newSettings.dateFormat);
    setTimeFormat(newSettings.timeFormat);
    setNumberFormat(newSettings.numberFormat);
    setRegion(newSettings.region);

    localStorage.setItem('saleduct_localization', JSON.stringify(newSettings));
    localStorage.setItem('saleduct_currency', newSettings.currency);
    localStorage.setItem('saleduct_date_format', newSettings.dateFormat);
    localStorage.setItem('saleduct_time_format', newSettings.timeFormat);
  };

  const formatCurrency = (value: number): string => {
    const locale = currencyToLocale[currency] || 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const use24Hour = timeFormat === '24h';

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !use24Hour,
    };

    return d.toLocaleDateString('en-US', dateOptions) + ' ' + d.toLocaleTimeString('en-US', timeOptions);
  };

  return (
    <LocalizationContext.Provider
      value={{
        currency,
        dateFormat,
        timeFormat,
        numberFormat,
        locale: currencyToLocale[currency] || 'en-US',
        region,
        setLocalization,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
