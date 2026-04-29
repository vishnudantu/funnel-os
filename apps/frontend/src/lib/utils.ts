import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency?: string): string {
  // Get currency from localStorage if not provided
  const storedCurrency = currency || localStorage.getItem('saleduct_currency') || 'USD';

  const currencyMap: Record<string, { locale: string; symbol: string }> = {
    'USD': { locale: 'en-US', symbol: '$' },
    'EUR': { locale: 'de-DE', symbol: '€' },
    'GBP': { locale: 'en-GB', symbol: '£' },
    'INR': { locale: 'en-IN', symbol: '₹' },
    'JPY': { locale: 'ja-JP', symbol: '¥' },
    'AUD': { locale: 'en-AU', symbol: 'A$' },
    'CAD': { locale: 'en-CA', symbol: 'C$' },
    'SGD': { locale: 'en-SG', symbol: 'S$' },
    'AED': { locale: 'ar-AE', symbol: 'د.إ' },
    'BRL': { locale: 'pt-BR', symbol: 'R$' },
    'CNY': { locale: 'zh-CN', symbol: '¥' },
    'CHF': { locale: 'de-CH', symbol: 'CHF' },
    'KRW': { locale: 'ko-KR', symbol: '₩' },
    'MXN': { locale: 'es-MX', symbol: '$' },
    'RUB': { locale: 'ru-RU', symbol: '₽' },
    'ZAR': { locale: 'en-ZA', symbol: 'R' },
  };

  const config = currencyMap[storedCurrency] || { locale: 'en-US', symbol: '$' };

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: storedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string, dateFormat?: string, timeFormat?: string): string {
  const storedDateFormat = dateFormat || localStorage.getItem('saleduct_date_format') || 'MM/DD/YYYY';
  const storedTimeFormat = timeFormat || localStorage.getItem('saleduct_time_format') || '12h';

  const d = new Date(date);

  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: storedTimeFormat === '12h'
  });

  return `${datePart} ${timePart}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  return cleaned;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#DC2626';
    case 'high':
      return '#EA580C';
    case 'medium':
      return '#D97706';
    case 'low':
      return '#16A34A';
    default:
      return '#64748B';
  }
}

export function getSourceColor(source: string): string {
  switch (source) {
    case 'meta-ads':
      return '#1877F2';
    case 'whatsapp':
      return '#25D366';
    case 'website':
      return '#8B5CF6';
    case 'manual':
      return '#64748B';
    case 'import':
      return '#0EA5E9';
    default:
      return '#94A3B8';
  }
}
