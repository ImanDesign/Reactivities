import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import { store } from "./store";
import { Profile } from "../models/profile";
import { Pagination, PagingParams } from "../models/pagination";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  loadingInitial = false;
  loading = false;
  editMode = false;
  pagination: Pagination | null = null;
  pagingParams = new PagingParams();
  predicate = new Map().set('all', true);

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.predicate.keys(),
      () => {
        this.pagingParams = new PagingParams();
        this.activityRegistry.clear();
        this.loadActivities();
      }
    )
  }

  loadActivities = async () => {
    this.setLoadingInitial(true);
    try {
      const result = await agent.Activities.list(this.axiosParams);
      result.data.forEach((activity) => {
        this.setActivity(activity);
      });
      this.setPagination(result.pagination);
    } catch (error) {
      console.log(error);
    } finally {
      this.setLoadingInitial(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) this.selectedActivity = activity;
    else {
      this.setLoadingInitial(true);
      try {
        activity = await agent.Activities.details(id);
        this.setActivity(activity);

        runInAction(() => {
          this.selectedActivity = activity;
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.setLoadingInitial(false);
      }
    }
  };

  setPagination = (pagination: Pagination) => {
    this.pagination = pagination;
  }

  setPagingParams = (pagingParams: PagingParams) => {
    this.pagingParams = pagingParams;
  }

  setPredicate = (predicate: string, value: string | Date) => {
    // For running reaction we need to delete the 'startDate' key first
    if(predicate !== 'startDate') { 
      this.predicate.forEach((value, key) => {
        if(key !== 'stratDate') this.predicate.delete(key);
      });
      this.predicate.set(predicate, true);
    }
    else {
      this.predicate.delete('startDate');
      this.predicate.set(predicate, value);
    }



    // const resetPredicate = () => {
    //   this.predicate.forEach((value, key) => {
    //     if(key !== 'stratDate') this.predicate.delete(key);
    //   })
    // }

    // switch(predicate) {
    //   case 'all':
    //     resetPredicate();
    //     this.predicate.set('all', true);
    //     break;
    //   case 'isGoing':
    //     resetPredicate();
    //     this.predicate.set('isGoing', true);
    //     break;
    //     case 'isHost':
    //       resetPredicate();
    //       this.predicate.set('isHost', true);
    //       break;
    //     case 'startDate':
    //       // For running reaction we need to delete the 'startDate' key first
    //       this.predicate.delete('startDate');
    //       this.predicate.set('startDate', value);
    //       break;
    // }
  }

  get axiosParams() {
    const params = new URLSearchParams();
    params.append('pageNumber', this.pagingParams.pageNumber.toString());
    params.append('pageSize', this.pagingParams.pageSize.toString());
    this.predicate.forEach((value, key) => {
      if(key === 'startDate') {
        params.append('startDate', (value as Date).toISOString());
      } else {
        params.append(key, value);
      }
    })
    return params;
  }

  private setActivity = (activity: Activity) => {
    const user = store.userStore.user;
    if (user) {
      activity.isGoing = activity.attendees?.some(
        (a) => a.username === user.username
      );
      activity.isHost = activity.hostUsername === user.username;
      activity.host = activity.attendees?.find(
        (a) => a.username === activity.hostUsername
      );
    }
    activity.date = new Date(activity.date!);

    this.activityRegistry.set(activity.id, activity);
  };

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  get groupedActivities() {
    const sortedActivities = Array.from(this.activityRegistry.values()).sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );

    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = format(activity.date!, "dd MMM yyyy");
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
  }

  updateActivityProfile = (profile: Profile) => {
    this.activityRegistry.forEach((activity) => {
      if (activity.host && activity.host.username === profile.username)
        activity.host = profile;

      activity.attendees = activity.attendees.map((attendee) => {
        if (attendee.username === profile.username) attendee = profile;
        return attendee;
      });
    });
  };

  setLoadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  setLoading = (state: boolean) => {
    this.loading = state;
  };

  setEditMode = (state: boolean) => {
    this.editMode = state;
  };

  createActivity = async (activity: ActivityFormValues) => {
    const user = store.userStore.user;
    const attendee = new Profile(user!);

    try {
      activity.id = uuid();
      await agent.Activities.create(activity);

      // Replicate server and client data
      const newActivity: Activity = new Activity(activity);
      newActivity.hostUsername = user!.username;
      newActivity.attendees = [attendee];

      runInAction(() => {
        this.setActivity(newActivity);
        this.selectedActivity = newActivity;
      });
    } catch (error) {
      console.log(error);
    }
  };

  updateActivity = async (activity: ActivityFormValues) => {
    try {
      await agent.Activities.update(activity);

      runInAction(() => {
        if (activity.id) {
          const updatedActivity = {
            ...this.getActivity(activity.id),
            ...activity,
          };

          this.activityRegistry.set(activity.id, updatedActivity as Activity);
          this.selectedActivity = updatedActivity as Activity;
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  deleteActivity = async (id: string) => {
    this.setLoading(true);
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.setLoading(false);
    }
  };

  updateAttendance = async () => {
    const user = store.userStore.user;
    this.loading = true;

    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        if (this.selectedActivity?.isGoing) {
          this.selectedActivity.attendees =
            this.selectedActivity.attendees?.filter(
              (a) => a.username !== user?.username
            );
          this.selectedActivity.isGoing = false;
        } else {
          const attendee = new Profile(user!);
          this.selectedActivity?.attendees?.push(attendee);
          this.selectedActivity!.isGoing = true;
        }

        this.activityRegistry.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  cancelActivityToggle = async () => {
    this.loading = true;

    try {
      await agent.Activities.attend(this.selectedActivity!.id);
      runInAction(() => {
        this.selectedActivity!.isCancelled =
          !this.selectedActivity!.isCancelled;
        this.activityRegistry.set(
          this.selectedActivity!.id,
          this.selectedActivity!
        );
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  clearSelectedActivity = () => {
    this.selectedActivity = undefined;
  };

  updateAttendeeFollowing = (username: string) => {
    this.activityRegistry.forEach((activity) => {
      activity.attendees.forEach((attendee) => {
        if (attendee.username === username) {
          attendee.following
            ? attendee.followersCount--
            : attendee.followersCount++;
          attendee.following = !attendee.following;
        }
      });
    });
  };
}
