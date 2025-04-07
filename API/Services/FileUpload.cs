namespace API.Services;

public class FileUpload(IHttpContextAccessor httpContextAccessor)
{
    private readonly HttpRequest _request = httpContextAccessor.HttpContext!.Request;
    public async Task<string> Upload(IFormFile file)
    {
        var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        
        if (!Directory.Exists(uploadFolder))
        {
            Directory.CreateDirectory(uploadFolder);
        }
        
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        
        var filePath = Path.Combine(uploadFolder, fileName);
        
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        
        return fileName;
    }

    public string GetFileUrl(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath)) return string.Empty;
        return $"{_request.Scheme}://{_request.Host.Value}/{filePath}";
    }
}
