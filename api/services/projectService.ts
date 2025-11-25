/**
 * Project Service
 */
import { get, post, put, del } from '../client';
import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '../types';
import type { PagedResultDto } from '../types';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const projectService = {
  /**
   * Get projects with pagination
   */
  async getProjects(params?: {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PagedResult<ProjectDto>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/api/Projects${queryString ? `?${queryString}` : ''}`;
    const response = await get<PagedResult<ProjectDto>>(endpoint);
    return response.data;
  },

  /**
   * Get project by ID
   */
  async getById(id: number): Promise<ProjectDto> {
    const response = await get<ProjectDto>(`/api/Projects/${id}`);
    return response.data;
  },

  /**
   * Create project
   */
  async create(data: CreateProjectDto): Promise<ProjectDto> {
    const response = await post<ProjectDto>('/api/Projects', data);
    return response.data;
  },

  /**
   * Update project
   */
  async update(id: number, data: UpdateProjectDto): Promise<ProjectDto> {
    const response = await put<ProjectDto>(`/api/Projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete project
   */
  async delete(id: number): Promise<void> {
    await del(`/api/Projects/${id}`);
  },

  /**
   * Add member to project
   */
  async addMember(projectId: number, userId: string, role?: string): Promise<void> {
    await post(`/api/Projects/${projectId}/members`, { userId, role });
  },

  /**
   * Remove member from project
   */
  async removeMember(projectId: number, userId: string): Promise<void> {
    await del(`/api/Projects/${projectId}/members/${userId}`);
  },
};

