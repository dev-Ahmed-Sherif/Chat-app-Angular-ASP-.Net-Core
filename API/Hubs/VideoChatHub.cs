using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs
{
    [Authorize]
    public class VideoChatHub : Hub
    {
        public async Task SendOffer(string receiverId, string offer)
        {
            await Clients.User(receiverId).SendAsync("ReceiveOffer", Context.UserIdentifier, offer);
        }
        public async Task SendAnswer(string receiverId, string answre)
        {
            await Clients.User(receiverId).SendAsync("ReceiveAnswer", Context.UserIdentifier, answre);
        }
        public async Task SendIceCandidate(string receiverId, string candidate)
        {
            await Clients.User(receiverId).SendAsync("ReceiveIceCandidate", Context.UserIdentifier, candidate);
        }
        public async Task EndCall(string receiverId)
        {
            await Clients.User(receiverId).SendAsync("CallEnded");
        }

        public async Task JoinRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserJoined", Context.ConnectionId);
        }

        public async Task LeaveRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserLeft", Context.ConnectionId);
        }
    }
}
