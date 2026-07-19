using JobBoard.Data;
using JobBoard.Models;
using JobBoard.Services;
using Microsoft.EntityFrameworkCore;

namespace JobBoard.Tests.Services;

public class JobServiceTests
{
    private static JobBoardContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<JobBoardContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new JobBoardContext(options);
    }

    [Fact]
    public async Task AddJobAsync_PersistsTheJob()
    {
        await using var context = CreateContext();
        var service = new JobService(context);
        var job = new Job
        {
            Title = "Backend Engineer",
            Company = "Acme",
            Location = "Remote",
            Description = "Build things",
            JobType = JobType.FullTime,
            Remote = RemoteType.Remote,
        };

        await service.AddJobAsync(job);

        Assert.Equal(1, await context.Jobs.CountAsync());
    }

    [Fact]
    public async Task GetAllJobsAsync_ReturnsJobsNewestFirst()
    {
        await using var context = CreateContext();
        var service = new JobService(context);
        var older = new Job
        {
            Title = "Older Job",
            Company = "Acme",
            Location = "Remote",
            Description = "First posted",
            JobType = JobType.FullTime,
            Remote = RemoteType.Remote,
            PostedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        };
        var newer = new Job
        {
            Title = "Newer Job",
            Company = "Acme",
            Location = "Remote",
            Description = "Posted later",
            JobType = JobType.Contract,
            Remote = RemoteType.Onsite,
            PostedDate = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
        };
        await service.AddJobAsync(older);
        await service.AddJobAsync(newer);

        var jobs = await service.GetAllJobsAsync();

        Assert.Equal(["Newer Job", "Older Job"], jobs.Select(j => j.Title));
    }
}
