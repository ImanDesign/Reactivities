import { Link } from "react-router-dom";
import { Item, Button, Icon, Segment, Label } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import { useState, SyntheticEvent } from "react";
import { useStore } from "../../../app/stores/store";
import { observer } from "mobx-react-lite";
import { format } from "date-fns";
import ActivityListItemAttendee from "./ActivityListItemAttendee";

interface Props {
  activity: Activity;
}

export default observer(function ActivityListItem({ activity }: Props) {
  const { activityStore } = useStore();
  const { loading, deleteActivity } = activityStore;

  const [target, setTarget] = useState("");

  function handleActivityDelete(
    e: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) {
    setTarget(e.currentTarget.name);
    deleteActivity(id);
  }

  return (
    <Segment.Group>
      <Segment>
        {activity.isCancelled &&
          <Label attached="top" color="red" content='Cancelled' style={{textAlign: 'center'}} />
        }
        <Item.Group>
          <Item>
            <Item.Image style={{marginBottom: 4}} size="tiny" circular src={activity.host?.image || "/assets/user.png"} />
            <Item.Content>
              <Item.Header as="a">{activity.title}</Item.Header>
              <Item.Description>Hosted by <Link to={`/profile/${activity.host?.username}`}>{activity.host?.displayName}</Link></Item.Description>
              {activity.isHost && (
                <Item.Description>
                  <Label basic color="orange" content='You are hosting this activity' />
                </Item.Description>
              )}
              {activity.isGoing && !activity.isHost && (
                <Item.Description>
                  <Label basic color="green" content='You are going to this activity' />
                </Item.Description>
              )}
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <Segment>
        <span>
          <Icon name="clock" /> {format(activity.date!, 'dd MMM yyyy h:mm aa')}
          <Icon name="marker" /> {activity.venue}
        </span>
      </Segment>
      <Segment secondary>
        <ActivityListItemAttendee attendees={activity.attendees!} />
      </Segment>
      <Segment clearing>
        <span>{activity.description}</span>
        <Button
          as={Link}
          to={`/activities/${activity.id}`}
          color="teal"
          floated="right"
          content="View"
        />
      </Segment>
    </Segment.Group>
  );
});
