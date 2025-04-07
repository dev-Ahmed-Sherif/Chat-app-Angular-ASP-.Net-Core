using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "Username is required")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 20 characters long")]
    public required string UserName { get; set; }
    [Required(ErrorMessage = "Fullname is required")]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "Fullname must be between 3 and 20 characters long")]
    public required string FullName { get; set; }
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public required string Email { get; set; }
    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long")]
    public required string Password { get; set; }
    [Required(ErrorMessage = "Profile image is required")]
    //[FileExtensions(Extensions = "jpg,jpeg,png", ErrorMessage = "Invalid file type. Only jpg, jpeg, and png files are allowed.")]
    //[RegularExpression(@"^.*\.(jpg|jpeg|png)$", ErrorMessage = "Invalid file type. Only jpg, jpeg, and png files are allowed.")]
    // [DataType(DataType.Upload)]
    public required IFormFile ProfileImage { get; set; }
}
