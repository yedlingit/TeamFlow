-- Procedure: GetProjectProgress
-- Description: Calculates the percentage of completed tasks for a given project.
-- Note: This is T-SQL syntax for documentation purposes as SQLite does not support Stored Procedures.

CREATE PROCEDURE GetProjectProgress
    @ProjectId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalTasks INT;
    DECLARE @CompletedTasks INT;
    DECLARE @Progress DECIMAL(5, 2);

    SELECT @TotalTasks = COUNT(*) 
    FROM Tasks 
    WHERE ProjectId = @ProjectId;

    IF @TotalTasks = 0
    BEGIN
        SELECT 0 AS Progress;
        RETURN;
    END

    SELECT @CompletedTasks = COUNT(*) 
    FROM Tasks 
    WHERE ProjectId = @ProjectId AND Status = 2; -- Assuming 2 is 'Done'

    SET @Progress = (@CompletedTasks * 100.0) / @TotalTasks;

    SELECT @Progress AS Progress;
END;
GO

-- Procedure: GetUserTaskStats
-- Description: Returns the count of tasks in each status for a specific user.

CREATE PROCEDURE GetUserTaskStats
    @UserId NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        t.Status,
        COUNT(*) as TaskCount
    FROM Tasks t
    JOIN TaskAssignments ta ON t.Id = ta.TaskId
    WHERE ta.UserId = @UserId
    GROUP BY t.Status;
END;
GO
