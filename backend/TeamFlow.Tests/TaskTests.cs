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
            // Arrange & Act
            var task = new TeamFlow.Domain.Entities.Task();

            // Assert
            Assert.Equal(TaskStatus.ToDo, task.Status);
        }

        [Fact]
        public void NewTask_ShouldHaveDefaultPriorityMedium()
        {
            // Arrange & Act
            var task = new TeamFlow.Domain.Entities.Task();

            // Assert
            Assert.Equal(TaskPriority.Medium, task.Priority);
        }

        [Fact]
        public void NewTask_ShouldHaveCreatedAtSet()
        {
            // Arrange & Act
            var task = new TeamFlow.Domain.Entities.Task();

            // Assert
            Assert.NotEqual(default(DateTime), task.CreatedAt);
            Assert.True(task.CreatedAt <= DateTime.UtcNow);
            Assert.True(task.CreatedAt > DateTime.UtcNow.AddSeconds(-1));
        }
    }
}
