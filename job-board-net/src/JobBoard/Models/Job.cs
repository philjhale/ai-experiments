namespace JobBoard.Models;

public class Job
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Company { get; set; } = "";
    public string Location { get; set; } = "";
    public string Description { get; set; } = "";
    public JobType EmploymentType { get; set; }
    public RemoteType LocationType { get; set; }
    public string ApplicationUrl { get; set; } = "";
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
}

public enum JobType { FullTime, PartTime, Contract }
public enum RemoteType { Remote, Onsite, Hybrid }
