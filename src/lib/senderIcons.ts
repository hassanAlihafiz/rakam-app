const SENDER_MAP: Record<string, string> = {
  whatsapp: 'WhatsApp',
  google: 'Google',
  paypal: 'PayPal',
  binance: 'Binance',
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  amazon: 'Amazon',
  apple: 'Apple',
  microsoft: 'Microsoft',
  telegram: 'Telegram',
  uber: 'Uber',
  airbnb: 'Airbnb',
};

export function getSenderLabel(raw: string): string {
  const lower = raw.toLowerCase();
  for (const key of Object.keys(SENDER_MAP)) {
    if (lower.includes(key)) {
      return SENDER_MAP[key];
    }
  }
  if (!raw) {
    return raw;
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
