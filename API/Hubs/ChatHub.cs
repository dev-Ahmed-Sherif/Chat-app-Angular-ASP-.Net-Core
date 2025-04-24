using System.Collections.Concurrent;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Hubs;

[Authorize]
public class ChatHub(UserManager<AppUser> userManager, AppDbContext context) : Hub
{
    public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var receiverId = httpContext?.Request.Query["senderId"].ToString();
        var userId = httpContext?.User!.GetUserId();
        var userName = httpContext?.User!.Identity!.Name;
        var currentUserById = await userManager.FindByIdAsync(userId!);
        var currentUser = await userManager.FindByNameAsync(userName!);
        var ConnectionId = Context.ConnectionId;

        if (onlineUsers.ContainsKey(userName!))
        {
            onlineUsers[userName!].ConnectionId = ConnectionId;
        }
        else
        {
            onlineUsers.TryAdd(userName!, new OnlineUserDto
            {
                // Id = currentUser.Id,
                ConnectionId = ConnectionId,
                UserName = currentUser!.UserName,
                FullName = currentUser.FullName,
                ProfileImage = currentUser.ProfileImage,
                // IsOnline = true,
                // UnreadCount = 0
            });
            await Clients.AllExcept(ConnectionId).SendAsync("Notify", currentUser);

        }

        if (!string.IsNullOrEmpty(receiverId))
        {
            await LoadMessages(receiverId!);
        }

        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }

    public async Task SendMessage(MessageRequestDto message)
    {
        var senderId = Context.User!.GetUserId();
        var recipientId = message.ReceiverId;
        var currentUser = await userManager.FindByIdAsync(senderId!);
        var receiver = await userManager.FindByIdAsync(message.ReceiverId!);

        if (receiver == null) return;

        var newMessage = new Message
        {
            SenderId = senderId,
            ReceiverId = message.ReceiverId,
            Content = message.Content,
            Sender = currentUser,
            Receiver = receiver,
            IsRead = false,
            CreatedDate = DateTime.Now
        };

        context.Messages.Add(newMessage);
        await context.SaveChangesAsync();

        await Clients.User(recipientId!).SendAsync("ReceiveNewMessage", newMessage);
    }

    public async Task NotifyTyping(string recipientUserName)
    {
        var senderUserName = Context.User!.GetUserName();
        // var currentUser = await userManager.FindByNameAsync(senderUserName!);
        // var recipientUser = await userManager.FindByNameAsync(recipientUserName!);

        if (senderUserName is null) return;

        var connectionId = onlineUsers.Values.FirstOrDefault(u => u.UserName == recipientUserName)?.ConnectionId;

        if (connectionId is not null)
        {
            await Clients.Client(connectionId).SendAsync("NotifyTypingToUser", senderUserName);
            // await Clients.User(recipientUserName).SendAsync("NotifyTypingToUser", senderUserName);
        }

    }

    public async Task LoadMessages(string recipientId, int pageNumber = 1)
    {
        int pageSize = 10;

        var userName = Context.User!.GetUserName();

        var currentUser = await userManager.FindByNameAsync(userName!);

        if (currentUser is null) return;

        List<MessageResponseDto> messages = await context.Messages
        .Where(m =>
               (m.ReceiverId == currentUser.Id &&
               m.SenderId == recipientId) ||
               (m.SenderId == currentUser.Id &&
               m.ReceiverId == recipientId))
        .OrderByDescending(m => m.CreatedDate)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .OrderBy(m => m.CreatedDate)
        .Select(m => new MessageResponseDto
        {
            Id = m.Id,
            Content = m.Content,
            CreatedDate = m.CreatedDate,
            ReceiverId = m.ReceiverId,
            SenderId = m.SenderId,
            // IsRead = m.IsRead,
        }).ToListAsync();

        foreach (var message in messages)
        {
            var msg = await context.Messages.FirstOrDefaultAsync(m => m.Id == message.Id);
            if (msg != null && msg.ReceiverId == currentUser.Id && !msg.IsRead)
            {
                msg.IsRead = true;
                context.Messages.Update(msg);
                await context.SaveChangesAsync();
            }
        }

        await Task.Delay(1000);

        await Clients.User(currentUser.Id)
              .SendAsync("ReceiveMessageList", messages);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var senderUserName = Context.User!.GetUserName();
        onlineUsers.TryRemove(senderUserName!, out _);
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }

    private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
    {
        var userName = Context.User!.GetUserName();

        var onlineUsersSet = new HashSet<string>(onlineUsers.Keys);

        var users = await userManager.Users
            .Select(u => new OnlineUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                FullName = u.FullName,
                ProfileImage = u.ProfileImage,
                IsOnline = onlineUsersSet.Contains(u.UserName!),
                UnreadCount = context.Messages.Count(m =>
                    m.ReceiverId == userName
                    && m.SenderId != u.Id
                    && !m.IsRead),
            })
            .OrderByDescending(m => m.IsOnline)
            .ToListAsync();

        return users;
    }
}
