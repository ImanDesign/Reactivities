using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class DataContext : IdentityDbContext<AppUser>
{
    public DataContext(DbContextOptions options) : base(options)
    { }

    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ActivityAttendee>(aa => aa.HasKey(x => new {x.AppUserId, x.ActivityId}));

        modelBuilder.Entity<ActivityAttendee>()
            .HasOne(x => x.AppUser)
            .WithMany(x => x.Activities)
            .HasForeignKey(x => x.AppUserId);

        modelBuilder.Entity<ActivityAttendee>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.Attendees)
            .HasForeignKey(x => x.ActivityId);

        modelBuilder.Entity<Comment>()
            .HasOne(comment => comment.Activity)
            .WithMany(activity => activity.Comments)
            .OnDelete(DeleteBehavior.Cascade);
    }
}