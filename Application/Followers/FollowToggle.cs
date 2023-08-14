using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers;

public class FollowToggle
{
    public class Command : IRequest<Result<Unit>>
    {
        public string TargetUsername { get; set; }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            _context = context;
            _userAccessor = userAccessor;
        }

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var currentUser = await _context.Users.SingleOrDefaultAsync(user => user.UserName == _userAccessor.GetUserName(), cancellationToken: cancellationToken);
            if (currentUser == null) return null;

            var targetUser = await _context.Users.SingleOrDefaultAsync(user => user.UserName == request.TargetUsername, cancellationToken: cancellationToken);
            if (targetUser == null) return null;

            var following = await _context.UserFollowings.FindAsync(currentUser.Id, targetUser.Id);
            if (following == null)
            {
                _context.UserFollowings.Add(new UserFollowing
                {
                    Observer = currentUser,
                    Target = targetUser
                });
            }
            else
            {
                _context.UserFollowings.Remove(following);
            }

            var result = await _context.SaveChangesAsync(cancellationToken) > 0;

            return result ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Problem update user following");
        }
    }
}