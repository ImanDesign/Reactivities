using Application.Core;
using Application.Dtos;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments;

public class Add
{
    public class Command : IRequest<Result<CommentDto>>
    {
        public Guid ActivityId { get; set; }
        public string Body { get; set; }
    }

    public class CommentValidation : AbstractValidator<Command>
    {
        public CommentValidation()
        {
            RuleFor(x => x.Body).NotEmpty();
        }
    }

    public class Handler : IRequestHandler<Command, Result<CommentDto>>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;
        private readonly IMapper _mapper;

        public Handler(DataContext context, IUserAccessor userAccessor, IMapper mapper)
        {
            _context = context;
            _userAccessor = userAccessor;
            _mapper = mapper;
        }

        public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .Include(user => user.Photos)
                .SingleOrDefaultAsync(user => user.UserName == _userAccessor.GetUserName(),
                cancellationToken);

            if (user == null) return null;

            var activity = await _context.Activities.FindAsync(request.ActivityId);
            
            if (activity == null) return null;

            var comment = new Comment
            {
                Body = request.Body,
                Author = user,
                Activity = activity
            };

            _context.Comments.Add(comment);

            var result = await _context.SaveChangesAsync(cancellationToken) > 0;

            return result ? Result<CommentDto>.Success(_mapper.Map<CommentDto>(comment)) : Result<CommentDto>.Failure("Problem adding new comment");
        }
    }
}