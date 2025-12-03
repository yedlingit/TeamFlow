using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeamFlow.Domain.Entities;
using TeamFlow.Domain.Enums;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async System.Threading.Tasks.Task InitializeAsync(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // Ensure database is created
            await context.Database.MigrateAsync();

            // Check if any users exist
            if (await userManager.Users.AnyAsync())
            {
                return; // DB has been seeded
            }

            // 1. Create Roles if they don't exist (Identity Roles)
            // Although we use UserRole enum, Identity might use string roles for [Authorize(Roles="...")]
            string[] roles = { "Administrator", "TeamLeader", "Member" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 2. Create Organization
            var organization = new Organization
            {
                Name = "Acme Corp",
                Description = "Przykładowa organizacja technologiczna",
                InvitationCode = "ACME2025",
                CreatedAt = DateTime.UtcNow
            };

            context.Organizations.Add(organization);
            await context.SaveChangesAsync();

            // 3. Create Users
            var users = new List<(string Email, string FirstName, string LastName, UserRole Role)>
            {
                ("admin@acme.com", "Adam", "Administrator", UserRole.Administrator),
                ("manager1@acme.com", "Marek", "Menadżer", UserRole.TeamLeader),
                ("manager2@acme.com", "Monika", "Kierownik", UserRole.TeamLeader),
                ("dev1@acme.com", "Jan", "Kowalski", UserRole.Member),
                ("dev2@acme.com", "Anna", "Nowak", UserRole.Member),
                ("dev3@acme.com", "Piotr", "Zieliński", UserRole.Member),
                ("dev4@acme.com", "Katarzyna", "Wiśniewska", UserRole.Member),
                ("dev5@acme.com", "Tomasz", "Wójcik", UserRole.Member),
                ("dev6@acme.com", "Agnieszka", "Kamińska", UserRole.Member),
                ("dev7@acme.com", "Michał", "Lewandowski", UserRole.Member),
                ("dev8@acme.com", "Magdalena", "Dąbrowska", UserRole.Member)
            };

            foreach (var userData in users)
            {
                var user = new ApplicationUser
                {
                    UserName = userData.Email,
                    Email = userData.Email,
                    FirstName = userData.FirstName,
                    LastName = userData.LastName,
                    OrganizationId = organization.Id,
                    Role = userData.Role,
                    EmailConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(user, "Password123!");

                if (result.Succeeded)
                {
                    // Assign Identity Role based on Enum
                    await userManager.AddToRoleAsync(user, userData.Role.ToString());
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
