using Application.Core;
using Application.Dtos;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Persistence;

namespace Application.Activities;

public class Create
{
    public class Command : IRequest<Result<Activity>>
    {
        public Activity Activity { get; set; }
    }

    public class ActivityValidation : AbstractValidator<Command>
    {
        public ActivityValidation()
        {
            RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
        }
    }

    public class Handler : IRequestHandler<Command, Result<Activity>>
    {
        private readonly DataContext _dataContext;
        private readonly IUserAccessor _userAccessor;
        private readonly IMapper _mapper;

        public Handler(DataContext dataContext, IUserAccessor userAccessor, IMapper mapper)
        {
            _dataContext = dataContext;
            _userAccessor = userAccessor;
            _mapper = mapper;
        }

        public async Task<Result<Activity>> Handle(Command request, CancellationToken cancellationToken)
        {
            // Find user object from Users table
            var user = _dataContext.Users.FirstOrDefault(user => user.UserName == _userAccessor.GetUserName());

            // Create attendee object and add it to the activity object
            var attendee = new ActivityAttendee
            {
                AppUser = user,
                Activity = request.Activity,
                IsHost = true
            };
            request.Activity.Attendees.Add(attendee);

            // Add activity object to the corresponding table
            _dataContext.Activities.Add(request.Activity);

            var result = await _dataContext.SaveChangesAsync(cancellationToken) > 0;

            if(!result) return Result<Activity>.Failure("Failed to create activity!");

            return Result<Activity>.Success(request.Activity);
        }
    }
}