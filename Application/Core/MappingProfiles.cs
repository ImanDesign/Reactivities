using API.DTOs;
using Application.Dtos;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        string currentUsername = null;

        CreateMap<Activity, Activity>();
        
        CreateMap<Activity, ActivityDto>()
            .ForMember(dm => dm.HostUsername, 
                mo => mo.MapFrom(s => s.Attendees.FirstOrDefault(a => a.IsHost).AppUser.UserName));
        
        CreateMap<ActivityAttendee, AttendeeDto>()
            .ForMember(dm => dm.DisplayName, 
                om => om.MapFrom(s => s.AppUser.DisplayName))
            .ForMember(dm => dm.Username,
                om => om.MapFrom(s => s.AppUser.UserName))
            .ForMember(dm => dm.Bio,
                om => om.MapFrom(s => s.AppUser.Bio))
            .ForMember(dm => dm.Image,
                om => om.MapFrom(s => s.AppUser.Photos.FirstOrDefault(p => p.IsMain).Url))
            .ForMember(dm => dm.FollowersCount,
                om => om.MapFrom(s => s.AppUser.Followers.Count))
            .ForMember(dm => dm.FollowingCount,
                om => om.MapFrom(s => s.AppUser.Followings.Count))
            .ForMember(dm => dm.Following,
                om => om.MapFrom(s => s.AppUser.Followers.Any(f => f.Observer.UserName == currentUsername)));

        CreateMap<AppUser, Profiles.Profile>()
            .ForMember(dm => dm.Image,
                om => om.MapFrom(s => s.Photos.FirstOrDefault(p => p.IsMain).Url))
            .ForMember(dm => dm.FollowersCount,
                om => om.MapFrom(s => s.Followers.Count))
            .ForMember(dm => dm.FollowingCount,
                om => om.MapFrom(s => s.Followings.Count))
            .ForMember(dm => dm.Following,
                om => om.MapFrom(s => s.Followers.Any(f => f.Observer.UserName == currentUsername)));
        
        CreateMap<Comment, CommentDto>()
            .ForMember(dm => dm.DisplayName,
                om => om.MapFrom(s => s.Author.DisplayName))
            .ForMember(dm => dm.Username,
                om => om.MapFrom(s => s.Author.UserName))
            .ForMember(dm => dm.Image,
                om => om.MapFrom(s => s.Author.Photos.FirstOrDefault(p => p.IsMain).Url));

        CreateMap<ActivityAttendee, UserActivityDto>()
            .ForMember(dm => dm.Id,
                om => om.MapFrom(s => s.Activity.Id))
            .ForMember(dm => dm.Title,
                om => om.MapFrom(s => s.Activity.Title))
            .ForMember(dm => dm.Category,
                om => om.MapFrom(s => s.Activity.Category))
            .ForMember(dm => dm.Date,
                om => om.MapFrom(s => s.Activity.Date))
            .ForMember(dm => dm.HostUsername,
                om => om.MapFrom(s => s.Activity.Attendees.FirstOrDefault(a => a.IsHost).AppUser.UserName));
    }
}