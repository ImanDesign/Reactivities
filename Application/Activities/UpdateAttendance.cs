using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities;

public class UpdateAttendance
{
    public class Command : IRequest<Result<Unit>>
    {
        public Guid ActivityId { get; set; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext _dbContext;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext dbContext, IUserAccessor userAccessor)
        {
            _dbContext = dbContext;
            _userAccessor = userAccessor;
        }

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await _dbContext.Activities
                .Include(a => a.Attendees)
                .ThenInclude(aa => aa.AppUser)
                .SingleOrDefaultAsync(a => a.Id == request.ActivityId, cancellationToken: cancellationToken);

            if (activity == null) return null;

            var currentUser =
                await _dbContext.Users.FirstOrDefaultAsync(u => u.UserName == _userAccessor.GetUserName(), cancellationToken);

            if (currentUser == null) return null;

            var hostUsername = activity.Attendees.FirstOrDefault(a => a.IsHost)?.AppUser.UserName;

            var attendance =
                activity.Attendees.FirstOrDefault(a => a.AppUser.UserName == currentUser.UserName);

            if (attendance != null && hostUsername == currentUser.UserName)
                activity.IsCancelled = !activity.IsCancelled;

            if (attendance != null && hostUsername != currentUser.UserName)
                activity.Attendees.Remove(attendance);

            if (attendance == null)
            {
                activity.Attendees.Add(new ActivityAttendee
                {
                    AppUser = currentUser,
                    Activity = activity,
                    IsHost = false
                });
            }

            var result = await _dbContext.SaveChangesAsync(cancellationToken) > 0;

            return result ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Problem updating attendance");
        }
    }
}