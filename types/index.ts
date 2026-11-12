export type SubscriptionTier = 'Free Trial' | 'Pro Plan Monthly' | 'Yearly Max Plan';

export interface UserSession {
  email: string;
  phone: string;
  countryCode: string;
  tier: SubscriptionTier;
  isActive: boolean;
}

export interface XRayData {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string[];
  vulnerabilities: string[];
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  starred: boolean;
  copies: number;
  views: number;
  tags: string[];
  xray?: XRayData;
  createdAt?: string;
  updatedAt?: string;
}