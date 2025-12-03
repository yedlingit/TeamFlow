using Xunit;
using TeamFlow.Domain.Entities;
using TeamFlow.Domain.Enums;
using TaskStatus = TeamFlow.Domain.Enums.TaskStatus;

namespace TeamFlow.Tests
{
    public class TaskTests
    {
        [Fact]
        public void NewTask_ShouldHaveDefaultStatusToDo()
        {
            // Przygotowanie i Działanie
            var task = new TeamFlow.Domain.Entities.Task();

            // Asercja
            Assert.Equal(TaskStatus.ToDo, task.Status);
        }

        [Fact]
        public void NewTask_ShouldHaveDefaultPriorityMedium()
        {
            // Przygotowanie i Działanie
            var task = new TeamFlow.Domain.Entities.Task();

            // Asercja
            Assert.Equal(TaskPriority.Medium, task.Priority);
        }

        [Fact]
        public void NewTask_ShouldHaveCreatedAtSet()
        {
            // Przygotowanie i Działanie
            var task = new TeamFlow.Domain.Entities.Task();

            // Asercja
            Assert.NotEqual(default(DateTime), task.CreatedAt);
            Assert.True(task.CreatedAt <= DateTime.UtcNow);
            Assert.True(task.CreatedAt > DateTime.UtcNow.AddSeconds(-1));
        }
    }
}
