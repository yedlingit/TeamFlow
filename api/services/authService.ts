/**
 * Authentication Service
 */
import { get, post } from '../client';
import type { LoginDto, RegisterDto, RegisterResponseDto, UserDto } from '../types';
import { mapRoleToString } from '../utils/roleMapper';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<RegisterResponseDto> {
    const response = await post<RegisterResponseDto>('/api/Auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginDto): Promise<UserDto> {
    const response = await post<UserDto>('/api/Auth/login', data);
    // Map role from number to string if needed (fallback for old API)
    response.data.role = mapRoleToString(response.data.role as any);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await post('/api/Auth/logout');
  },

  /**
   * Get current user
   */
  async getMe(): Promise<UserDto> {
    const response = await get<UserDto>('/api/Auth/me');
    // Map role from number to string if needed (fallback for old API)
    response.data.role = mapRoleToString(response.data.role as any);
    return response.data;
  },
};

