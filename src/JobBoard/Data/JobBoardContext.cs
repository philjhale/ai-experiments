using JobBoard.Models;
using Microsoft.EntityFrameworkCore;

namespace JobBoard.Data;

public class JobBoardContext(DbContextOptions<JobBoardContext> options) : DbContext(options)
{
    public DbSet<Job> Jobs => Set<Job>();
}
