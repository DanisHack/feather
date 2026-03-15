import axios from 'axios';
import type { Account } from '../types';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/portfolio`,
  headers: { 'Content-Type': 'application/json' },
});

export const plaidClient = {
  async createLinkToken(): Promise<string> {
    const { data } = await api.post('/link-token');
    return data.linkToken;
  },

  async exchangePublicToken(publicToken: string): Promise<{ accessToken: string }> {
    const { data } = await api.post('/exchange-token', { publicToken });
    return data;
  },

  async getAccounts(): Promise<Account[]> {
    const { data } = await api.get('/accounts');
    return data.accounts;
  },

  async getHoldings(accountId: string): Promise<Account> {
    const { data } = await api.get(`/accounts/${accountId}/holdings`);
    return data;
  },

  async disconnectBroker(accountId: string): Promise<void> {
    await api.delete(`/accounts/${accountId}`);
  },
};
