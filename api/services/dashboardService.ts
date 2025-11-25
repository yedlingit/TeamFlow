/**
 * Dashboard Service
 */
import { get } from '../client';
import type { DashboardStatsDto } from '../types';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStatsDto> {
    const response = await get<DashboardStatsDto>('/api/Dashboard/stats');
    return response.data;
  },
};

