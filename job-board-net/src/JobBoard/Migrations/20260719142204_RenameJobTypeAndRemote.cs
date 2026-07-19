using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobBoard.Migrations
{
    /// <inheritdoc />
    public partial class RenameJobTypeAndRemote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Remote",
                table: "Jobs",
                newName: "LocationType");

            migrationBuilder.RenameColumn(
                name: "JobType",
                table: "Jobs",
                newName: "EmploymentType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LocationType",
                table: "Jobs",
                newName: "Remote");

            migrationBuilder.RenameColumn(
                name: "EmploymentType",
                table: "Jobs",
                newName: "JobType");
        }
    }
}
