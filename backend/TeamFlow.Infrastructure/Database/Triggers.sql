-- Trigger: UpdateProjectLastActivity
-- Description: Updates the Project's UpdatedAt timestamp whenever a Task in that project is inserted, updated, or deleted.

-- Trigger for INSERT
CREATE TRIGGER UpdateProjectLastActivity_Insert
AFTER INSERT ON Tasks
BEGIN
    UPDATE Projects
    SET UpdatedAt = DATETIME('now')
    WHERE Id = NEW.ProjectId;
END;

-- Trigger for UPDATE
CREATE TRIGGER UpdateProjectLastActivity_Update
AFTER UPDATE ON Tasks
BEGIN
    UPDATE Projects
    SET UpdatedAt = DATETIME('now')
    WHERE Id = NEW.ProjectId;
END;

-- Trigger for DELETE
CREATE TRIGGER UpdateProjectLastActivity_Delete
AFTER DELETE ON Tasks
BEGIN
    UPDATE Projects
    SET UpdatedAt = DATETIME('now')
    WHERE Id = OLD.ProjectId;
END;
