using Application.Core;
using Application.Dtos;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities;

public class Edit
{
    public class Command : IRequest<Result<Unit>>
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

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext _dataContext;
        private readonly IMapper _mapper;

        public Handler(DataContext dataContext, IMapper mapper)
        {
            _dataContext = dataContext;
            _mapper = mapper;
        }

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activityInDb = await _dataContext.Activities.FindAsync(request.Activity.Id);

            if (activityInDb == null) return Result<Unit>.Success(Unit.Value);

            _mapper.Map(request.Activity, activityInDb);

            var result = await _dataContext.SaveChangesAsync(cancellationToken) > 0;

            if(!result) return Result<Unit>.Failure("Failed to update the activity!");

            return Result<Unit>.Success(Unit.Value);

        }
    }
}