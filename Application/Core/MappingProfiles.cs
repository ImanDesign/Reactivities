using API.DTOs;
using Application.Dtos;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
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
                om => om.MapFrom(s => s.AppUser.Photos.FirstOrDefault(p => p.IsMain).Url));
        CreateMap<AppUser, Profiles.Profile>()
            .ForMember(dm => dm.Image,
                om => om.MapFrom(s => s.Photos.FirstOrDefault(p => p.IsMain).Url));
    }
}