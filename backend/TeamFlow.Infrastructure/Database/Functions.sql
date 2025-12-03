-- Function: CalculateTaskDuration
-- Description: Calculates the number of days a task has been open (or took to complete).
-- Note: This is T-SQL syntax for documentation purposes as SQLite does not support scalar functions in this way.

CREATE FUNCTION CalculateTaskDuration (@TaskId INT)
RETURNS INT
AS
BEGIN
    DECLARE @CreatedAt DATETIME;
    DECLARE @UpdatedAt DATETIME;
    DECLARE @Status INT;
    DECLARE @Duration INT;

    SELECT @CreatedAt = CreatedAt, @UpdatedAt = UpdatedAt, @Status = Status
    FROM Tasks
    WHERE Id = @TaskId;

    -- If task is Done (Status = 2), use UpdatedAt as end time (assuming it was updated when completed)
    -- Otherwise use current date
    IF @Status = 2 AND @UpdatedAt IS NOT NULL
    BEGIN
        SET @Duration = DATEDIFF(DAY, @CreatedAt, @UpdatedAt);
    END
    ELSE
    BEGIN
        SET @Duration = DATEDIFF(DAY, @CreatedAt, GETDATE());
    END

    RETURN @Duration;
END;
GO
