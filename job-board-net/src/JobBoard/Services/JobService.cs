using JobBoard.Data;
using JobBoard.Models;
using Microsoft.EntityFrameworkCore;

namespace JobBoard.Services;

public class JobService(JobBoardContext context)
{
    public async Task<List<Job>> GetAllJobsAsync() =>
        await context.Jobs.OrderByDescending(j => j.PostedDate).ToListAsync();

    public async Task AddJobAsync(Job job)
    {
        context.Jobs.Add(job);
        await context.SaveChangesAsync();
    }

    public async Task DeleteJobAsync(int id)
    {
        var job = await context.Jobs.FindAsync(id);
        if (job is null)
        {
            return;
        }

        context.Jobs.Remove(job);
        await context.SaveChangesAsync();
    }
}
