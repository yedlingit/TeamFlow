/**
 * Task Service
 */
import { get, post, put, patch, del } from '../client';
import type { TaskDto, TaskDetailDto, CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from '../types';
import type { PagedResult } from './projectService';

export const taskService = {
  /**
   * Get tasks with pagination
   */
  async getTasks(params?: {
    projectId?: number;
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PagedResult<TaskDto>> {
    const queryParams = new URLSearchParams();
    if (params?.projectId) queryParams.append('projectId', params.projectId.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.assigneeId) queryParams.append('assigneeId', params.assigneeId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/api/Tasks${queryString ? `?${queryString}` : ''}`;
    const response = await get<PagedResult<TaskDto>>(endpoint);
    return response.data;
  },

  /**
   * Get task by ID
   */
  async getById(id: number): Promise<TaskDetailDto> {
    const response = await get<TaskDetailDto>(`/api/Tasks/${id}`);
    return response.data;
  },

  /**
   * Create task
   */
  async create(data: CreateTaskDto): Promise<TaskDto> {
    const response = await post<TaskDto>('/api/Tasks', data);
    return response.data;
  },

  /**
   * Update task
   */
  async update(id: number, data: UpdateTaskDto): Promise<TaskDto> {
    const response = await put<TaskDto>(`/api/Tasks/${id}`, data);
    return response.data;
  },

  /**
   * Update task status (for drag & drop)
   */
  async updateStatus(id: number, status: 'ToDo' | 'InProgress' | 'Done'): Promise<TaskDto> {
    const response = await patch<TaskDto>(`/api/Tasks/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete task
   */
  async delete(id: number): Promise<void> {
    await del(`/api/Tasks/${id}`);
  },

  /**
   * Add assignee to task
   */
  async addAssignee(taskId: number, userId: string): Promise<void> {
    await post(`/api/Tasks/${taskId}/assignees`, { userId });
  },

  /**
   * Remove assignee from task
   */
  async removeAssignee(taskId: number, userId: string): Promise<void> {
    await del(`/api/Tasks/${taskId}/assignees/${userId}`);
  },

  /**
   * Get task comments
   */
  async getComments(taskId: number): Promise<any[]> {
    const response = await get<any[]>(`/api/Tasks/${taskId}/comments`);
    return response.data;
  },

  /**
   * Add comment to task
   */
  async addComment(taskId: number, content: string): Promise<any> {
    const response = await post(`/api/Tasks/${taskId}/comments`, { content });
    return response.data;
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: number): Promise<void> {
    await del(`/api/Tasks/comments/${commentId}`);
  },
};

