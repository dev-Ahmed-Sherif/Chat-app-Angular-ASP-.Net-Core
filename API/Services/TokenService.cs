using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using API.Models;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService(IConfiguration configuration) 
{
    private readonly IConfiguration _configuration = configuration;
    public string GenerateToken(AppUser user)
    {
        var claims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier, user.Id),
            new (ClaimTypes.Name, user.UserName!)
        };
        
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration["JWTSettings:SecruirtyKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _configuration["JWTSettings:Issuer"],
            audience: _configuration["JWTSettings:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(30),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
