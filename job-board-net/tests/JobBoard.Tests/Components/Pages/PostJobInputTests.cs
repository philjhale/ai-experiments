using System.ComponentModel.DataAnnotations;
using JobBoard.Components.Pages;

namespace JobBoard.Tests.Components.Pages;

public class PostJobInputTests
{
    private static Post.JobInput ValidJobInput() => new()
    {
        Title = "Backend Engineer",
        Company = "Acme",
        Location = "Remote",
        Description = "Build things",
        ApplicationUrl = "https://acme.example.com/careers/backend-engineer",
    };

    private static bool TryValidate(Post.JobInput input, out List<ValidationResult> results)
    {
        results = [];
        return Validator.TryValidateObject(input, new ValidationContext(input), results, validateAllProperties: true);
    }

    [Fact]
    public void ApplicationUrl_RejectsEmptyValue()
    {
        var input = ValidJobInput();
        input.ApplicationUrl = "";

        var isValid = TryValidate(input, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(Post.JobInput.ApplicationUrl)));
    }

    [Fact]
    public void ApplicationUrl_RejectsMalformedUrl()
    {
        var input = ValidJobInput();
        input.ApplicationUrl = "not-a-url";

        var isValid = TryValidate(input, out var results);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(Post.JobInput.ApplicationUrl)));
    }

    [Fact]
    public void ApplicationUrl_AcceptsWellFormedUrl()
    {
        var input = ValidJobInput();

        var isValid = TryValidate(input, out var results);

        Assert.True(isValid, string.Join(", ", results.Select(r => r.ErrorMessage)));
    }
}
