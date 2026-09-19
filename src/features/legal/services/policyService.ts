import { AppUrls } from '@/shared/config/appUrls';

export interface PolicyItem {
  id: number;
  uuid: string;
  type: 'PRIVACY_POLICY' | 'TERMS_CONDITION' | 'TRIP_POLICY' | 'HELP_AND_SUPPORT' | string;
  content: string;
  status: string;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyResponseData {
  PRIVACY_POLICY?: PolicyItem[];
  TERMS_CONDITION?: PolicyItem[];
  TRIP_POLICY?: PolicyItem[];
  HELP_AND_SUPPORT?: PolicyItem[];
}

export interface ParsedSupportInfo {
  phone: string;
  email: string;
  emergency: string;
}

/**
 * Converts English digits (0-9) to Bengali digits (০-৯).
 */
export function toBengaliDigits(input: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)] || d);
}

/**
 * Parses HELP_AND_SUPPORT item content:
 * Expected format: "01997709990,help@tripyservic.com"
 * Handles both plain strings and HTML-wrapped strings (e.g. <span style="...">...</span>).
 * Emergency number is ALWAYS 999 as per business requirement.
 */
export function parseHelpAndSupport(content: string | undefined | null): ParsedSupportInfo {
  const fallback: ParsedSupportInfo = {
    phone: '01997709990',
    email: 'help@tripyservic.com',
    emergency: '999',
  };

  if (!content || typeof content !== 'string') {
    return fallback;
  }

  // Strip HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  const parts = plainText.split(',').map((s) => s.trim());

  let phone = parts[0] || fallback.phone;
  let email = parts[1] || fallback.email;

  // Clean phone to only digits and +
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone.length >= 5) {
    phone = cleanPhone;
  } else {
    phone = fallback.phone;
  }

  if (!email || !email.includes('@')) {
    email = fallback.email;
  }

  return {
    phone,
    email,
    emergency: '999', // Emergency number is strictly always 999
  };
}

// In-memory cache by language_country key
const policyCache = new Map<
  string,
  { data: PolicyResponseData | null; support: ParsedSupportInfo; timestamp: number }
>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches privacy policy, terms, conditions, trip policy, and help/support contacts.
 * Rule:
 * - If language is 'bn': language_code=bn, country_code=BD
 * - If language is 'en': language_code=en, country_code=GB
 */
export async function fetchPolicyAndSupport(language: string = 'bn'): Promise<{
  data: PolicyResponseData | null;
  support: ParsedSupportInfo;
}> {
  const isBn = language === 'bn';
  const language_code = isBn ? 'bn' : 'en';
  const country_code = isBn ? 'BD' : 'GB';
  const cacheKey = `${language_code}_${country_code}`;

  const cached = policyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { data: cached.data, support: cached.support };
  }

  const queryParams = new URLSearchParams({
    platform: 'web',
    language_code,
    country_code,
  });

  const urlsToTry = [
    `${AppUrls.proxy.privacyPolicyTermsCondition}?${queryParams.toString()}`,
    `${AppUrls.backend.privacyPolicyTermsCondition}?${queryParams.toString()}`,
  ];

  let rawData: PolicyResponseData | null = null;

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.status && json.data) {
          rawData = json.data;
          break;
        }
      }
    } catch {
      // Fall through to next URL
    }
  }

  const helpItem = rawData?.HELP_AND_SUPPORT?.[0];
  const support = parseHelpAndSupport(helpItem?.content);

  policyCache.set(cacheKey, {
    data: rawData,
    support,
    timestamp: Date.now(),
  });

  return { data: rawData, support };
}
