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
            EmploymentType = JobType.FullTime,
            LocationType = RemoteType.Remote,
            ApplicationUrl = "https://acme.example.com/careers/backend-engineer",
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
            EmploymentType = JobType.FullTime,
            LocationType = RemoteType.Remote,
            ApplicationUrl = "https://acme.example.com/careers/older-job",
            PostedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        };
        var newer = new Job
        {
            Title = "Newer Job",
            Company = "Acme",
            Location = "Remote",
            Description = "Posted later",
            EmploymentType = JobType.Contract,
            LocationType = RemoteType.Onsite,
            ApplicationUrl = "https://acme.example.com/careers/newer-job",
            PostedDate = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
        };
        await service.AddJobAsync(older);
        await service.AddJobAsync(newer);

        var jobs = await service.GetAllJobsAsync();

        Assert.Equal(["Newer Job", "Older Job"], jobs.Select(j => j.Title));
    }

    [Fact]
    public async Task DeleteJobAsync_RemovesTheJob()
    {
        await using var context = CreateContext();
        var service = new JobService(context);
        var toDelete = new Job
        {
            Title = "Delete Me",
            Company = "Acme",
            Location = "Remote",
            Description = "Should be removed",
            EmploymentType = JobType.FullTime,
            LocationType = RemoteType.Remote,
            ApplicationUrl = "https://acme.example.com/careers/delete-me",
        };
        var toKeep = new Job
        {
            Title = "Keep Me",
            Company = "Acme",
            Location = "Remote",
            Description = "Should remain",
            EmploymentType = JobType.Contract,
            LocationType = RemoteType.Onsite,
            ApplicationUrl = "https://acme.example.com/careers/keep-me",
        };
        await service.AddJobAsync(toDelete);
        await service.AddJobAsync(toKeep);

        await service.DeleteJobAsync(toDelete.Id);

        var jobs = await service.GetAllJobsAsync();
        Assert.Equal(["Keep Me"], jobs.Select(j => j.Title));
    }

    [Fact]
    public async Task DeleteJobAsync_NonExistentId_DoesNothing()
    {
        await using var context = CreateContext();
        var service = new JobService(context);
        var job = new Job
        {
            Title = "Existing Job",
            Company = "Acme",
            Location = "Remote",
            Description = "Stays put",
            EmploymentType = JobType.FullTime,
            LocationType = RemoteType.Remote,
            ApplicationUrl = "https://acme.example.com/careers/existing-job",
        };
        await service.AddJobAsync(job);

        await service.DeleteJobAsync(9999);

        var jobs = await service.GetAllJobsAsync();
        Assert.Equal(["Existing Job"], jobs.Select(j => j.Title));
    }
}
