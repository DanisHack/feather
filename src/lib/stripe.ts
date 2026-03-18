import { api } from './api';

export const stripeClient = {
  async createCheckoutSession(plan: 'monthly' | 'annual'): Promise<string> {
    const { data } = await api.post('/api/subscriptions/checkout', { plan });
    return data.url;
  },

  async createPortalSession(): Promise<string> {
    const { data } = await api.post('/api/subscriptions/portal');
    return data.url;
  },

  async getSubscription(): Promise<{
    status: 'trialing' | 'active' | 'canceled' | 'past_due';
    plan: 'monthly' | 'annual';
    currentPeriodEnd: string;
    trialEnd?: string;
  }> {
    const { data } = await api.get('/api/subscriptions/status');
    return data;
  },

  async cancelSubscription(): Promise<void> {
    await api.post('/api/subscriptions/cancel');
  },
};
