/**
 * Logo.dev integration service for financial accounts and institutions.
 * Fetches high-resolution company and banking logos directly from img.logo.dev.
 */

export const BANK_DOMAIN_MAP: Record<string, string> = {
  // Indonesian Major Banks
  'bca': 'bca.co.id',
  'bank central asia': 'bca.co.id',
  'mandiri': 'bankmandiri.co.id',
  'bank mandiri': 'bankmandiri.co.id',
  'bri': 'bri.co.id',
  'bank bri': 'bri.co.id',
  'bank rakyat indonesia': 'bri.co.id',
  'bni': 'bni.co.id',
  'bank bni': 'bni.co.id',
  'bank negara indonesia': 'bni.co.id',
  'bsi': 'bankbsi.co.id',
  'bank bsi': 'bankbsi.co.id',
  'bank syariah indonesia': 'bankbsi.co.id',
  'cimb': 'cimbniaga.co.id',
  'cimb niaga': 'cimbniaga.co.id',
  'bank cimb niaga': 'cimbniaga.co.id',
  'permata': 'permatabank.com',
  'bank permata': 'permatabank.com',
  'danamon': 'danamon.co.id',
  'bank danamon': 'danamon.co.id',
  'btn': 'btn.co.id',
  'bank btn': 'btn.co.id',
  'panin': 'panin.co.id',
  'bank panin': 'panin.co.id',
  'ocbc': 'ocbc.id',
  'ocbc nisp': 'ocbc.id',
  'bank ocbc nisp': 'ocbc.id',

  // Digital Banks & Neo Banks
  'jago': 'jago.com',
  'bank jago': 'jago.com',
  'jago loan': 'jago.com',
  'seabank': 'seabank.co.id',
  'sea bank': 'seabank.co.id',
  'krom': 'krom.id',
  'krom bank': 'krom.id',
  'sampoerna': 'banksampoerna.com',
  'bank sampoerna': 'banksampoerna.com',
  'superbank': 'superbank.id',
  'blu': 'blubybcadigital.id',
  'blu bca': 'blubybcadigital.id',
  'allo': 'allobank.com',
  'allo bank': 'allobank.com',
  'jenius': 'jenius.com',
  'line bank': 'linebank.co.id',
  'neo': 'bankneocommerce.co.id',
  'bank neo commerce': 'bankneocommerce.co.id',
  'aladin': 'aladinbank.id',
  'bank aladin': 'aladinbank.id',

  // E-Wallets
  'gopay': 'gopay.co.id',
  'gojek': 'gojek.com',
  'shopeepay': 'shopee.co.id',
  'shopee pay': 'shopee.co.id',
  'spay': 'shopee.co.id',
  'spaylatter': 'shopee.co.id',
  'spaylater': 'shopee.co.id',
  'dana': 'dana.id',
  'ovo': 'ovo.id',
  'linkaja': 'linkaja.id',
  'link aja': 'linkaja.id',
  'isaku': 'i-saku.com',
  'i-saku': 'i-saku.com',
  'doku': 'doku.com',

  // Credit Cards & Paylaters & Fintech
  'honest': 'honest.co.id',
  'honest card': 'honest.co.id',
  'nex': 'nexcard.id',
  'nex card': 'nexcard.id',
  'kredivo': 'kredivo.com',
  'akulaku': 'akulaku.com',
  'indodax': 'indodax.com',
  'tokocrypto': 'tokocrypto.com',
  'pluang': 'pluang.com',
  'bibit': 'bibit.id',
  'bareksa': 'bareksa.com',
  'ajaib': 'ajaib.co.id',
  'stockbit': 'stockbit.com',
};

export const LOCAL_FALLBACK_ICONS: Record<string, string> = {
  'bca': '/icons/banks/bca.webp',
  'mandiri': '/icons/banks/mandiri.webp',
  'krom': '/icons/banks/krom.webp',
  'jago': '/icons/banks/jago.webp',
  'sampoerna': '/icons/banks/sampoerna.webp',
  'seabank': '/icons/banks/seabank.webp',
  'gopay': '/icons/banks/gopay.webp',
  'shopeepay': '/icons/banks/shopeepay.webp',
  'dana': '/icons/banks/dana.webp',
  'honest card': '/icons/banks/honest.webp',
  'nex card': '/icons/banks/nex.webp',
  'kredivo': '/icons/banks/kredivo.webp',
  'spaylatter': '/icons/banks/spaylatter.webp',
  'jago loan': '/icons/banks/jagoloan.webp',
  'superbank': '/icons/banks/superbank.webp',
  'cash': '/icons/banks/cash.svg',
};

export function getLogoDevToken(): string {
  try {
    const local = localStorage.getItem('ft_logodev_token');
    if (local && local.trim()) return local.trim();
  } catch {}
  return (
    (import.meta.env.VITE_LOGODEV_TOKEN as string | undefined) ||
    (import.meta.env.VITE_LOGO_DEV_TOKEN as string | undefined) ||
    ''
  ).trim();
}

export function setLogoDevToken(token: string): void {
  try {
    if (token.trim()) {
      localStorage.setItem('ft_logodev_token', token.trim());
    } else {
      localStorage.removeItem('ft_logodev_token');
    }
  } catch {}
}

export function getAccountDomain(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (key === 'cash' || key === 'tunai' || key === 'uang tunai') {
    return null;
  }
  if (BANK_DOMAIN_MAP[key]) {
    return BANK_DOMAIN_MAP[key];
  }
  if (key.includes('.')) {
    return key;
  }
  const clean = key.replace(/[^a-z0-9]/g, '');
  return clean ? `${clean}.com` : null;
}

export function getLogoDevUrl(
  accountName: string,
  options: { size?: number; format?: 'png' | 'webp' | 'jpg' } = {}
): string {
  const key = accountName.trim().toLowerCase();
  if (key === 'cash' || key === 'tunai' || key === 'uang tunai') {
    return '/icons/banks/cash.svg';
  }

  const domain = getAccountDomain(accountName);
  if (!domain) return '/icons/banks/cash.svg';

  const token = getLogoDevToken();
  const size = options.size || 128;
  const format = options.format || 'png';

  const params = new URLSearchParams();
  if (token) {
    params.set('token', token);
  }
  params.set('size', String(size));
  params.set('format', format);

  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

export function getLocalFallback(accountName: string): string | null {
  const key = accountName.trim().toLowerCase();
  return LOCAL_FALLBACK_ICONS[key] || null;
}
