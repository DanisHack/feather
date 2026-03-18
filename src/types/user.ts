export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  subscription?: {
    status: 'trialing' | 'active' | 'canceled' | 'past_due';
    plan: 'monthly' | 'annual';
    currentPeriodEnd: Date;
    trialEnd?: Date;
  };
}
