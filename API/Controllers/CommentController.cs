using Application.Comments;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class CommentController : BaseApiController
    {
        [HttpGet("{activityId}")]
        public async Task<IActionResult> GetComments(Guid activityId)
        {
            return HandleResult(await Mediator.Send(new List.Query {ActivityId = activityId}));
        }

        [HttpPost("{activityId}")]
        public async Task<IActionResult> AddComment(List.Query query)
        {
            return HandleResult(await Mediator.Send(query));
        }
    }
}
