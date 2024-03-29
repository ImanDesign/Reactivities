import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Photo, Profile, UserActivity } from "../models/profile";
import agent from "../api/agent";
import { store } from "./store";

export default class ProfileStore {
  profile: Profile | null = null;
  loadingProfile = false;
  uploadingPhoto = false;
  loading = false;
  followings: Profile[] = [];
  loadingFollowings = false;
  activeTab = 0;
  userActivities: UserActivity[] = [];
  loadingUserActivity = false;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.profile,
      profile => {
        if (profile) store.activityStore.updateActivityProfile(profile);
      }
    );

    reaction(
      () => this.activeTab,
      activeTab => {
        if(activeTab === 3 || activeTab === 4) {
          activeTab === 3 ? this.loadFollowings('followers') : this.loadFollowings('following')
        } else {
          this.followings = [];
        }
      }
    )
  }

  setActiveTab = (activeTab: any) => {
    this.activeTab = activeTab;
  }

  get isCurrentUser() {
    if (store.userStore.user && this.profile)
      return store.userStore.user.username === this.profile.username;
    return false;
  }

  loadProfile = async (username: string) => {
    this.loadingProfile = true;

    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingProfile = false;
      });
    }
  };

  uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true;

    try {
      const response = await agent.Profiles.uploadPhoto(file);
      const photo = response.data;
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo);
          if (photo.isMain) {
            store.userStore.setImage(photo.url);
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.uploadingPhoto = false;
      });
    }
  };

  setMainPhoto = async (photo: Photo) => {
    this.loading = true;

    try {
      await agent.Profiles.setMainPhoto(photo.id);
      store.userStore.setImage(photo.url);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos.find((p) => p.isMain)!.isMain = false;
          this.profile.photos.find((p) => p.id === photo.id)!.isMain = true;
          this.profile.image = photo.url;
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  deletePhoto = async (photo: Photo) => {
    this.loading = true;

    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction(() => {
        if (this.profile) {
          this.profile.photos = this.profile.photos?.filter(
            (p) => p.id !== photo.id
          );
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateProfile = async (profile: Partial<Profile>) => {
    this.loading = true;

    try {
      await agent.Profiles.updateProfile(profile);
      runInAction(() => {
        if (this.profile) {
          this.profile = { ...this.profile, ...profile };
          store.userStore.setDisplayName(this.profile.displayName);
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  updateFollowing = async (username: string, following: boolean) => {
    this.loading = true;

    try {
      await agent.Profiles.updateFollowing(username);
      store.activityStore.updateAttendeeFollowing(username);
      runInAction(() => {
        // the profile is not for current user 
        if (this.profile && this.profile.username !== store.userStore.user?.username && this.profile.username === username) {
          following
            ? this.profile.followersCount++
            : this.profile.followersCount--;
          this.profile.following = !this.profile.following;
        }
        if (this.profile && this.profile.username === store.userStore.user?.username) {
          following
            ? this.profile.followingCount++
            : this.profile.followingCount--;
        }
        this.followings.forEach(profile => {
          if(profile.username === username) {
            profile.following
              ? profile.followersCount--
              : profile.followersCount++;
            profile.following = !profile.following;
          }
        });
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  loadFollowings = async (predicate: string) => {
    this.loadingFollowings = true;

    try {
      const followings = await agent.Profiles.listFollowings(this.profile!.username, predicate);      
      runInAction(() => {
        this.followings = followings;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingFollowings = false;
      });
    }
  }

  loadUserActivities = async (predicate?: string) => {
    this.loadingUserActivity = true;

    try {
      const userActivities = await agent.Profiles.listActivities(this.profile!.username, predicate)

      runInAction(() => {
        this.userActivities = userActivities;
      });
    } catch (error) {
      console.log(error);
    } finally {
      runInAction(() => {
        this.loadingUserActivity = false;
      });
    }
  }
}
