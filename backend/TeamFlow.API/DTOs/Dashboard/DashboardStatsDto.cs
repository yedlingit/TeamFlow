namespace TeamFlow.API.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public TaskStatsDto TaskStats { get; set; } = new();
        public ProjectStatsDto ProjectStats { get; set; } = new();
        public List<UpcomingTaskDto> UpcomingTasks { get; set; } = new();
        public List<ActiveProjectDto> ActiveProjects { get; set; } = new();
    }

    public class TaskStatsDto
    {
        public int Total { get; set; }
        public int ToDo { get; set; }
        public int InProgress { get; set; }
        public int Done { get; set; }
    }

    public class ProjectStatsDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Inactive { get; set; }
    }

    public class UpcomingTaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public DateTime? DueDate { get; set; }
        public string Priority { get; set; } = string.Empty;
    }

    public class ActiveProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Progress { get; set; }
        public int TaskCount { get; set; }
        public int MemberCount { get; set; }
    }
}

