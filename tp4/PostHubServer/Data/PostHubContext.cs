
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PostHubServer.Models;

namespace PostHubServer.Data
{
    public class PostHubContext : IdentityDbContext<User>
    {
        public PostHubContext (DbContextOptions<PostHubContext> options) : base(options){}

        public DbSet<Hub> Hubs { get; set; } = default!;
        public DbSet<Comment> Comments { get; set; } = default!;
        public DbSet<Picture> Pictures { get; set; } = default!;
        public DbSet<Post> Posts { get; set; } = default!;
        protected override void OnModelCreating(ModelBuilder builder)
        {

            base.OnModelCreating(builder);

            // Rôles
            builder.Entity<IdentityRole>().HasData(
                new IdentityRole { Id = "1", Name = "moderateur", NormalizedName = "MODERATEUR" }
              
            );

            // Utilisateur(s)
            PasswordHasher<User> hasher = new PasswordHasher<User>();
            User u1 = new User
            {
                Id = "11111111-1111-1111-1111-111111111111",
                UserName = "Bob69",
                Email = "bobibou@mail.com",
                NormalizedUserName = "BOB69",
                NormalizedEmail = "BOBIBOU@MAIL.COM"
            };
            u1.PasswordHash = hasher.HashPassword(u1, "Salut1!");
            builder.Entity<User>().HasData(u1);

            // Relation entre utilisateurs et rôles
            builder.Entity<IdentityUserRole<string>>().HasData(
                new IdentityUserRole<string> { UserId = u1.Id, RoleId = "1" } // Bob69 est un Moderateur ! Wouhou 🥳
            );

        }
    }
}
