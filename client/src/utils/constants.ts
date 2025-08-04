export const BRAND_COLORS = {
  blue: '#003366',
  orange: '#F1762E',
  yellow: '#F1D337',
  teal: '#008080',
  cyan: '#27C7D9',
  red: '#F23030',
  white: '#FFFFFF',
} as const;

export const SOCIAL_PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', color: 'comuniti-teal' },
  { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'comuniti-orange' },
  { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: 'comuniti-blue' },
  { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: 'comuniti-cyan' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: 'comuniti-blue' },
  { id: 'other', name: 'Other', icon: 'fas fa-globe', color: 'comuniti-teal' },
] as const;

export const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Healthcare',
  'Education',
  'Legal Services',
  'Real Estate',
  'Beauty & Wellness',
  'Transportation',
  'Financial Services',
  'Technology',
  'Other',
] as const;

export const COUNTRIES = [
  'Spain',
  'Portugal',
  'Mexico',
  'Colombia',
  'United Arab Emirates',
  'Thailand',
  'Singapore',
  'Germany',
  'France',
  'Italy',
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'EN', label: 'English' },
  { code: 'es', name: 'ES', label: 'Español' },
  { code: 'pt', name: 'PT', label: 'Português' },
] as const;

export const MIN_FOLLOWER_COUNT = 1;
