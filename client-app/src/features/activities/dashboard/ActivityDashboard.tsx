import { observer } from "mobx-react-lite";
import { Grid } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import ActivityList from "./ActivityList";
import { useEffect } from "react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import ActivityFilters from "./ActivityFilters";

export default observer(function ActivityDashboard() {
  const {activityStore} = useStore();
  const {loadActivities, activityRegistry, loadingInitial} = activityStore;

  useEffect(() => {
    if(activityRegistry.size <= 1) loadActivities();
  }, [loadActivities, activityRegistry.size]);

  if(loadingInitial) return <LoadingComponent content="Loading app" /> 

  return (
    <Grid>
      <Grid.Column width="10">
        <ActivityList />
      </Grid.Column>
      <Grid.Column width="6">
        <ActivityFilters />
      </Grid.Column>
    </Grid>
  );
})