using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class ChatHub : Hub
{
    private readonly IMediator _mediator;

    public ChatHub(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task SendComment(Add.Command command)
    {
        var comment = await _mediator.Send(command);

        await Clients.Group(command.ActivityId.ToString())
            .SendAsync("ReceiveComment", comment.Value);
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext != null)
        {
            var activityId = Guid.Parse(httpContext.Request.Query["activityId"]);
            await Groups.AddToGroupAsync(Context.ConnectionId, activityId.ToString());

            var listOfComments = await _mediator.Send(new List.Query {ActivityId = activityId});
            await Clients.Caller.SendAsync("LoadComments", listOfComments.Value);
        }
    }
}