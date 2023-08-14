namespace Domain;

public class UserFollowing
{
    // Observer (follower) is a person who follows another user (Target)
    public string ObserverId { get; set; }
    public AppUser Observer { get; set; }

    // Target (following) is a user who is followed by a person (Observer)
    public string TargetId { get; set; }
    public AppUser Target { get; set; }
}