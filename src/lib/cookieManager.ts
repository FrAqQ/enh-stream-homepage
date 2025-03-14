
/**
 * Cookie management utility for handling cookie consent
 */

// Cookie names
export const COOKIE_CONSENT = 'enhancestream_cookie_consent';
export const COOKIE_ANALYTICS = 'enhancestream_analytics_enabled';
export const COOKIE_PREFERENCES = 'enhancestream_preferences_enabled';
export const COOKIE_MARKETING = 'enhancestream_marketing_enabled';

// Cookie consent statuses
export type ConsentStatus = 'accepted' | 'rejected' | 'pending';

// Cookie categories
export interface CookieConsent {
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

/**
 * Set a cookie with the specified name, value and expiration days
 */
export function setCookie(name: string, value: string, days: number = 180): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  setCookie(name, '', -1);
}

/**
 * Save cookie consent preferences
 */
export function saveCookieConsent(status: ConsentStatus, consent?: CookieConsent): void {
  setCookie(COOKIE_CONSENT, status);
  
  if (status === 'accepted' && consent) {
    setCookie(COOKIE_ANALYTICS, consent.analytics ? 'true' : 'false');
    setCookie(COOKIE_PREFERENCES, consent.preferences ? 'true' : 'false');
    setCookie(COOKIE_MARKETING, consent.marketing ? 'true' : 'false');
  } else if (status === 'rejected') {
    // If rejected, set all to false
    setCookie(COOKIE_ANALYTICS, 'false');
    setCookie(COOKIE_PREFERENCES, 'false');
    setCookie(COOKIE_MARKETING, 'false');
  }
}

/**
 * Get current cookie consent status
 */
export function getCookieConsentStatus(): ConsentStatus {
  const status = getCookie(COOKIE_CONSENT);
  if (!status) return 'pending';
  return status as ConsentStatus;
}

/**
 * Get current cookie consent settings
 */
export function getCookieConsent(): CookieConsent {
  return {
    analytics: getCookie(COOKIE_ANALYTICS) === 'true',
    preferences: getCookie(COOKIE_PREFERENCES) === 'true',
    marketing: getCookie(COOKIE_MARKETING) === 'true'
  };
}

/**
 * Check if cookie consent is needed
 */
export function needsConsentPrompt(): boolean {
  return getCookieConsentStatus() === 'pending';
}
