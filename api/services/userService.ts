/**
 * User Service
 */
import { get, put, del } from '../client';
import type { UserListDto, UserDetailDto, UpdateUserDto, UpdateUserProfileDto, ChangePasswordDto } from '../types';
import type { PagedResult } from './projectService';
import { mapRoleToString } from '../utils/roleMapper';

export const userService = {
  /**
   * Get users with pagination
   */
  async getUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<UserListDto>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/Users${queryString ? `?${queryString}` : ''}`;
    const response = await get<PagedResult<UserListDto>>(endpoint);
    
    // Map roles from numbers to strings
    response.data.items = response.data.items.map(user => ({
      ...user,
      role: mapRoleToString(user.role as any),
    }));
    
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserDetailDto> {
    const response = await get<UserDetailDto>(`/api/Users/${id}`);
    // Map role from number to string if needed
    response.data.role = mapRoleToString(response.data.role as any);
    return response.data;
  },

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDto): Promise<UserDetailDto> {
    const response = await put<UserDetailDto>(`/api/Users/${id}`, data);
    // Map role from number to string if needed
    response.data.role = mapRoleToString(response.data.role as any);
    return response.data;
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await del(`/api/Users/${id}`);
  },

  /**
   * Update own profile
   */
  async updateProfile(data: UpdateUserProfileDto): Promise<UserDetailDto> {
    const response = await put<UserDetailDto>('/api/Users/me', data);
    // Map role from number to string if needed
    response.data.role = mapRoleToString(response.data.role as any);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await put('/api/Users/me/password', data);
  },
};

