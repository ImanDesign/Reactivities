using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Profile = Application.Profiles.Profile;

namespace Application.Followers;

public class List
{
    public class Query : IRequest<Result<List<Profile>>>
    {
        public string Predicate { get; set; }
        public string Username { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<List<Profile>>>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
        {
            _context = context;
            _mapper = mapper;
            _userAccessor = userAccessor;
        }

        public async Task<Result<List<Profile>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var profiles = new List<Profile>();
            
            switch (request.Predicate.ToLower())
            {
                case "followers":
                    profiles = await _context.UserFollowings
                        .Where(user => user.Target.UserName == request.Username)
                        .Select(user => user.Observer)
                        .ProjectTo<Profile>(_mapper.ConfigurationProvider, new {currentUsername = _userAccessor.GetUserName()})
                        .ToListAsync(cancellationToken);
                    break;
                case "following":
                    profiles = await _context.UserFollowings
                        .Where(user => user.Observer.UserName == request.Username)
                        .Select(user => user.Target)
                        .ProjectTo<Profile>(_mapper.ConfigurationProvider, new { currentUsername = _userAccessor.GetUserName() })
                        .ToListAsync(cancellationToken);
                    break;
            }

            return Result<List<Profile>>.Success(profiles);
        }
    }
}