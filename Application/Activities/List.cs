using Application.Core;
using Application.Dtos;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities;

public class List
{
    public class Query : IRequest<Result<PagedList<ActivityDto>>>
    {
        public ActivityParams ActivityParams { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<PagedList<ActivityDto>>>
    {
        private readonly DataContext _dataContext;
        private readonly IMapper _mapper;
        private readonly IUserAccessor _userAccessor;

        public Handler(DataContext dataContext, IMapper mapper, IUserAccessor userAccessor)
        {
            _dataContext = dataContext;
            _mapper = mapper;
            _userAccessor = userAccessor;
        }

        public async Task<Result<PagedList<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = _dataContext.Activities
                .Where(activity => activity.Date >= request.ActivityParams.StartDate)
                .OrderBy(activity => activity.Date)
                .ProjectTo<ActivityDto>(_mapper.ConfigurationProvider, 
                    new {currentUsername = _userAccessor.GetUserName()});

            if (request.ActivityParams.IsGoing && !request.ActivityParams.IsHost)
            {
                query = query.Where(activity => activity.Attendees.Any(a => a.Username == _userAccessor.GetUserName()));
            }

            if (!request.ActivityParams.IsGoing && request.ActivityParams.IsHost)
            {
                query = query.Where(activity => activity.HostUsername == _userAccessor.GetUserName());
            }

            return Result<PagedList<ActivityDto>>.Success
            (
                await PagedList<ActivityDto>.CreateAsync(query, request.ActivityParams.PageNumber, request.ActivityParams.PageSize)
            );
        }
    }
}