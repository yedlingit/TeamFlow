/**
 * Organization Service
 */
import { get, post, put, del } from '../client';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationDto,
  JoinOrganizationDto,
  JoinOrganizationResponseDto,
} from '../types';

export const organizationService = {
  /**
   * Create a new organization
   */
  async create(data: CreateOrganizationDto): Promise<OrganizationDto> {
    const response = await post<OrganizationDto>('/api/Organizations', data);
    return response.data;
  },

  /**
   * Join an organization by invitation code
   */
  async join(data: JoinOrganizationDto): Promise<JoinOrganizationResponseDto> {
    const response = await post<JoinOrganizationResponseDto>('/api/Organizations/join', data);
    return response.data;
  },

  /**
   * Get current user's organization
   */
  async getCurrent(): Promise<OrganizationDto> {
    const response = await get<OrganizationDto>('/api/Organizations/current');
    return response.data;
  },

  /**
   * Get organization by ID
   */
  async getById(id: number): Promise<OrganizationDto> {
    const response = await get<OrganizationDto>(`/api/Organizations/${id}`);
    return response.data;
  },

  /**
   * Update organization
   */
  async update(id: number, data: UpdateOrganizationDto): Promise<OrganizationDto> {
    const response = await put<OrganizationDto>(`/api/Organizations/${id}`, data);
    return response.data;
  },

  /**
   * Delete organization
   */
  async delete(id: number): Promise<void> {
    await del(`/api/Organizations/${id}`);
  },
};

