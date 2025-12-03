using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTriggers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create trigger for INSERT on Tasks
            migrationBuilder.Sql(@"
                CREATE TRIGGER UpdateProjectLastActivity_Insert
                AFTER INSERT ON Tasks
                BEGIN
                    UPDATE Projects
                    SET UpdatedAt = DATETIME('now')
                    WHERE Id = NEW.ProjectId;
                END;
            ");

            // Create trigger for UPDATE on Tasks
            migrationBuilder.Sql(@"
                CREATE TRIGGER UpdateProjectLastActivity_Update
                AFTER UPDATE ON Tasks
                BEGIN
                    UPDATE Projects
                    SET UpdatedAt = DATETIME('now')
                    WHERE Id = NEW.ProjectId;
                END;
            ");

            // Create trigger for DELETE on Tasks
            migrationBuilder.Sql(@"
                CREATE TRIGGER UpdateProjectLastActivity_Delete
                AFTER DELETE ON Tasks
                BEGIN
                    UPDATE Projects
                    SET UpdatedAt = DATETIME('now')
                    WHERE Id = OLD.ProjectId;
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS UpdateProjectLastActivity_Insert;");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS UpdateProjectLastActivity_Update;");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS UpdateProjectLastActivity_Delete;");
        }
    }
}
