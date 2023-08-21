using Application.Core;
using Application.Dtos;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles;

public class ListActivities
{
    public class Query : IRequest<Result<List<UserActivityDto>>>
    {
        public string Predicate { get; set; }
        public string Username { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>>
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public Handler(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = _context.ActivityAttendees
                .Where(aa => aa.AppUser.UserName == request.Username)
                .OrderBy(aa => aa.Activity.Date)
                .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider);

            if (!string.IsNullOrEmpty(request.Predicate))
            {
                query = request.Predicate.ToLower() switch
                {
                    "past" => query.Where(aa => aa.Date < DateTime.UtcNow),
                    "hosting" => query.Where(aa => aa.HostUsername == request.Username),
                    _ => query.Where(aa => aa.Date >= DateTime.UtcNow)
                };
            }

            var userActivityDtos = await query.ToListAsync(cancellationToken);

            return Result<List<UserActivityDto>>.Success(userActivityDtos);
        }
    }
}