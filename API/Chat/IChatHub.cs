using API.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace API.Chat;

internal interface IChatHub
{
    Task SendMessage(MessageRequestDto message);
    Task NotifyTyping(string recipientUserName);
    Task LoadMessages(string recipientId, int pageNumber = 1);
}
