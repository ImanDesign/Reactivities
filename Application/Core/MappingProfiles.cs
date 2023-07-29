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
        CreateMap<ActivityAttendee, Profiles.Profile>()
            .ForMember(dm => dm.DisplayName, 
                om => om.MapFrom(s => s.AppUser.DisplayName))
            .ForMember(dm => dm.Username,
                om => om.MapFrom(s => s.AppUser.UserName))
            .ForMember(dm => dm.Bio,
                om => om.MapFrom(s => s.AppUser.Bio));
    }
}