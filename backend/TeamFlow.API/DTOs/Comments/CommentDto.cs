namespace TeamFlow.API.DTOs.Comments
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int TaskId { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string? AuthorName { get; set; }
        public string? AuthorInitials { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

