/**
 * TypeScript types for API responses
 */

// Auth Types
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organizationId: number | null;
  organizationName: string | null;
  role: 'Member' | 'TeamLeader' | 'Administrator';
  isActive: boolean;
}

export interface RegisterResponseDto {
  userId: string;
  email: string;
  message: string;
}

// Organization Types
export interface CreateOrganizationDto {
  name: string;
  description?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
}

export interface OrganizationDto {
  id: number;
  name: string;
  description: string | null;
  invitationCode: string;
  createdAt: string;
  memberCount?: number;
  projectCount?: number;
}

export interface JoinOrganizationDto {
  invitationCode: string;
}

export interface JoinOrganizationResponseDto {
  organizationId: number;
  organizationName: string;
  message: string;
}

// Project Types
export interface CreateProjectDto {
  name: string;
  description?: string;
  teamLeaderId?: string;
  theme?: string;
  dueDate?: string;
  memberIds?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  teamLeaderId?: string;
  status?: 'Active' | 'Inactive';
  theme?: string;
  dueDate?: string;
  memberIds?: string[];
}

export interface ProjectDto {
  id: number;
  name: string;
  description: string | null;
  status: 'Active' | 'Inactive';
  theme: string | null;
  dueDate: string | null;
  organizationId: number;
  teamLeaderId: string | null;
  teamLeaderName: string | null;
  progress: number;
  taskCount: number;
  memberCount: number;
  createdAt: string;
  members?: ProjectMemberDto[];
}

export interface ProjectMemberDto {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  initials: string | null;
  role: string | null;
  joinedDate?: string;
}

// Task Types
export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: number;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'ToDo' | 'InProgress' | 'Done';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
}

export interface UpdateTaskStatusDto {
  status: 'ToDo' | 'InProgress' | 'Done';
}

export interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  status: 'ToDo' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string | null;
  projectId: number;
  projectName: string | null;
  assignees?: TaskAssigneeDto[];
  createdAt: string;
  updatedAt: string | null;
  commentCount: number;
}

export interface TaskDetailDto extends TaskDto {
  comments?: CommentDto[];
}

export interface TaskAssigneeDto {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  initials: string | null;
  assignedAt?: string;
}

// Comment Types
export interface CreateCommentDto {
  content: string;
}

export interface CommentDto {
  id: number;
  content: string;
  taskId: number;
  authorId: string;
  authorName: string | null;
  authorInitials: string | null;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStatsDto {
  taskStats: TaskStatsDto;
  projectStats: ProjectStatsDto;
  upcomingTasks: UpcomingTaskDto[];
  activeProjects: ActiveProjectDto[];
}

export interface TaskStatsDto {
  total: number;
  toDo: number;
  inProgress: number;
  done: number;
}

export interface ProjectStatsDto {
  total: number;
  active: number;
  inactive: number;
}

export interface UpcomingTaskDto {
  id: number;
  title: string;
  projectId: number;
  projectName: string | null;
  dueDate: string | null;
  priority: string;
}

export interface ActiveProjectDto {
  id: number;
  name: string;
  progress: number;
  taskCount: number;
  memberCount: number;
}

// User Types
export interface UserListDto {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  initials: string | null;
  role: 'Member' | 'TeamLeader' | 'Administrator';
  isActive: boolean;
  createdAt: string;
  projectCount: number;
}

export interface UserDetailDto {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  initials: string | null;
  role: 'Member' | 'TeamLeader' | 'Administrator';
  isActive: boolean;
  createdAt: string;
  organizationId: number | null;
  organizationName: string | null;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: 'Member' | 'TeamLeader' | 'Administrator';
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Common Types
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

