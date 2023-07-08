import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import {v4 as uuid} from 'uuid';
import { format } from "date-fns";

export default class ActivityStore {
    activityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    loadingInitial = false;
    loading = false;
    editMode = false;

    constructor() {
        makeAutoObservable(this);
    }

    loadActivities = async () => {
        this.setLoadingInitial(true);
        try {
            const activities = await agent.Activities.list();
            activities.forEach(activity => {
                this.setActivity(activity);
              });
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoadingInitial(false);
        }
    }

    loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if(activity) this.selectedActivity = activity;
        else {
            this.setLoadingInitial(true);
            try {
                activity = await agent.Activities.details(id);
                runInAction(() => {
                    this.selectedActivity = activity;
                });
                this.setActivity(activity);
            } catch (error) {
                console.log(error);
            } finally {
                this.setLoadingInitial(false);
            }
        }
    }

    private setActivity = (activity: Activity) => {
        activity.date = new Date(activity.date!);
        this.activityRegistry.set(activity.id, activity);
    }

    private getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    get groupedActivities() {
        const sortedActivities = Array.from(this.activityRegistry.values())
                    .sort((a, b) => a.date!.getTime() - b.date!.getTime())

        return Object.entries(
            sortedActivities.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMM yyyy');
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        )
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }

    setLoading = (state: boolean) => {
        this.loading = state;
    }

    setEditMode = (state: boolean) => {
        this.editMode = state;
    }

    createActivity = async (activity: Activity) => {
        this.setLoading(true);
        try {
            activity.id = uuid();
            await agent.Activities.create(activity);
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
            })
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoading(false);
            this.setEditMode(false);
        }
    }

    updateActivity = async (activity: Activity) => {
        this.setLoading(true);
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
            })
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoading(false);
            this.setEditMode(false);
        }
    }

    deleteActivity = async (id: string) => {
        this.setLoading(true);
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
            })
        } catch (error) {
            console.log(error);
        } finally {
            this.setLoading(false);
        }
    }
}