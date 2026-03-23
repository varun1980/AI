import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Orders
export const placeOrder = (data: any) => api.post('/orders', data).then((r) => r.data);
export const cancelOrder = (orderId: string) => api.delete(`/orders/${orderId}`).then((r) => r.data);
export const getOpenOrders = () => api.get('/orders/open').then((r) => r.data);
export const riskCheck = (data: any) => api.post('/orders/risk-check', data).then((r) => r.data);

// Portfolio
export const getPortfolioSummary = () => api.get('/portfolio/summary').then((r) => r.data);
export const getPerformance = (days: number) => api.get(`/portfolio/performance?days=${days}`).then((r) => r.data);

// Trade history
export const getTrades = (params?: any) => api.get('/trades', { params }).then((r) => r.data);
export const getTradeStats = () => api.get('/trades/stats').then((r) => r.data);
export const getTrade = (id: string) => api.get(`/trades/${id}`).then((r) => r.data);

// Strategies
export const getStrategies = () => api.get('/strategies').then((r) => r.data);
export const getStrategy = (id: string) => api.get(`/strategies/${id}`).then((r) => r.data);
export const createStrategy = (data: any) => api.post('/strategies', data).then((r) => r.data);
export const updateStrategy = (id: string, data: any) => api.put(`/strategies/${id}`, data).then((r) => r.data);
export const activateStrategy = (id: string) => api.patch(`/strategies/${id}/activate`).then((r) => r.data);
export const pauseStrategy = (id: string) => api.patch(`/strategies/${id}/pause`).then((r) => r.data);
export const deleteStrategy = (id: string) => api.delete(`/strategies/${id}`).then((r) => r.data);

// Scheduled orders
export const getScheduledOrders = () => api.get('/scheduler').then((r) => r.data);
export const createScheduledOrder = (data: any) => api.post('/scheduler', data).then((r) => r.data);
export const activateScheduledOrder = (id: string) => api.patch(`/scheduler/${id}/activate`).then((r) => r.data);
export const deactivateScheduledOrder = (id: string) => api.patch(`/scheduler/${id}/deactivate`).then((r) => r.data);
export const deleteScheduledOrder = (id: string) => api.delete(`/scheduler/${id}`).then((r) => r.data);

// Alerts
export const getAlerts = () => api.get('/alerts').then((r) => r.data);
export const createAlert = (data: any) => api.post('/alerts', data).then((r) => r.data);
export const deleteAlert = (id: string) => api.delete(`/alerts/${id}`).then((r) => r.data);
