using Application.Core;
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

        public Handler(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<Result<Activity>> Handle(Command request, CancellationToken cancellationToken)
        {
            _dataContext.Activities.Add(request.Activity);
            var result = await _dataContext.SaveChangesAsync(cancellationToken) > 0;

            if(!result) return Result<Activity>.Failure("Failed to create activity!");

            return Result<Activity>.Success(request.Activity);
        }
    }
}