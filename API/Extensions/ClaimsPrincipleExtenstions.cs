using System.Security.Claims;

namespace API.Extensions;

public static class ClaimsPrincipleExtenstions
{
    public static string GetUserId(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new 
            ArgumentException("UserName not found in claims");
    }

    public static string GetUserName(this ClaimsPrincipal user)
    {
        var userName = user.FindFirstValue(ClaimTypes.Name) ?? throw new 
            ArgumentException("UserName not found in claims");
        return userName;
    }

    public static string GetFullName(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("FullName") ?? string.Empty;
    }

    public static string GetProfileImage(this ClaimsPrincipal user)
    {
        return user.FindFirstValue("ProfileImage") ?? string.Empty;
    }
}
