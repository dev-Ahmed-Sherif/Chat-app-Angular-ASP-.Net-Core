using API.Common;
using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(UserManager<AppUser> userManager,FileUpload fileUpload, TokenService tokenService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDto registerDto)
        {   
            // Check if user already exists
            var existingUser = await userManager.FindByEmailAsync(registerDto.Email);
           
            if (existingUser != null)
            {
                return BadRequest(Response<string>.Failure("User already exists"));
            }

            var user = new AppUser
            {
                UserName = registerDto.UserName,
                FullName = registerDto.FullName,
                Email = registerDto.Email
            };
            
            var result = await userManager.CreateAsync(user, registerDto.Password);
            
            if (!result.Succeeded)
            {
               return BadRequest(Response<string>.Failure(result.Errors.
               Select(err => err.Description).FirstOrDefault()!));
            }
            // Upload the profile image
            user.ProfileImage = await fileUpload.Upload(registerDto.ProfileImage);
            await userManager.UpdateAsync(user);
            
            // foreach (var error in result.Errors)
            // {
            //     ModelState.AddModelError("Registration Error", error.Description);
            // }
            
            return Ok(Response<string>.Success("","User Created Successfully"));
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await userManager.FindByEmailAsync(loginDto.Email);
            
            if (user == null || !await userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                return BadRequest(Response<string>.Failure("Invalid credentials"));
            }
            
            var token = tokenService.GenerateToken(user);
            
            return Ok(Response<string>.Success(token,"Login Successful"));
        }
        [HttpGet("profile"),Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var currentUserId = User.GetUserId();
            var currentUser = await userManager.FindByIdAsync(currentUserId!);
            
            if (currentUser == null)
            {
                return NotFound(Response<string>.Failure("User not found"));
            }
            
            return Ok(Response<AppUser>.Success(currentUser,"Profile retrieved successfully"));
        }
    }
}
