using System.ComponentModel.DataAnnotations.Schema;

namespace API.Models;

public class Message
{
    public Message()
    {
        Id = Guid.NewGuid().ToString();
    }
    public string Id { get; set; }
    public string? Content { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsRead { get; set; }
    [ForeignKey("Sender")]
    public string? SenderId { get; set; }
    public AppUser? Sender { get; set; }
    [ForeignKey("Receiver")]
    public string? ReceiverId { get; set; }
    public AppUser? Receiver { get; set; }
}
