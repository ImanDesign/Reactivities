import { observer } from 'mobx-react-lite';
import {Button, Header, Item, Segment, Image, Label} from 'semantic-ui-react'
import {Activity} from "../../../app/models/activity";
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useStore } from '../../../app/stores/store';

const activityImageStyle = {
    filter: 'brightness(30%)'
};

const activityImageTextStyle = {
    position: 'absolute',
    bottom: '5%',
    left: '5%',
    width: '100%',
    height: 'auto',
    color: 'white'
};

interface Props {
    activity: Activity
}

export default observer (function ActivityDetailedHeader({activity}: Props) {
    const {activityStore: {updateAttendance, cancelActivityToggle, loading}} = useStore();

    return (
        <Segment.Group>
            <Segment basic attached='top' style={{padding: '0'}}>
                {activity.isCancelled &&
                    <Label style={{position: 'absolute', top: 20, left: -14, zIndex: 1000}} ribbon color='red' content='Cancelled' />
                }
                <Image src={`/assets/categoryImages/${activity.category}.jpg`} fluid style={activityImageStyle}/>
                <Segment style={activityImageTextStyle} basic>
                    <Item.Group>
                        <Item>
                            <Item.Content>
                                <Header
                                    size='huge'
                                    content={activity.title}
                                    style={{color: 'white'}}
                                />
                                <p>{format(activity.date!, 'dd MMM yyyy')}</p>
                                <p>
                                    Hosted by <strong><Link to={`/profile/${activity.host?.username}`}>{activity.host?.displayName}</Link></strong>
                                </p>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Segment>
            </Segment>
            <Segment clearing attached='bottom'>
                {activity.isHost ? (
                    <>
                        <Button disabled={activity.isCancelled} as={Link} to={`/manage/${activity.id}`} color='orange' floated='right'>
                            Manage Event
                        </Button>
                        <Button 
                            basic
                            onClick={cancelActivityToggle} 
                            color={activity.isCancelled ? 'green' : 'red'}
                            loading={loading}
                            content={activity.isCancelled ? 'Re-activate activity' : 'Cancel activity'}
                        />
                    </>
                    ) : activity.isGoing ? (
                    <Button onClick={updateAttendance} loading={loading}>Cancel attendance</Button>
                ): (
                    <Button disabled={activity.isCancelled} onClick={updateAttendance} loading={loading} color='teal'>Join Activity</Button>
                )}
            </Segment>
        </Segment.Group>
    )
})