import { observer } from "mobx-react-lite";
import { Profile } from "../../app/models/profile";
import { Card, Icon, Image } from "semantic-ui-react";
import { Link } from "react-router-dom";

interface Props {
    profile: Profile;
}

export default observer(function ProfileCard({profile}: Props) {
    return(
        <Card as={Link} to={`/profile/${profile.username}`}>
            <Image src={profile.image || '/assets/user.png'} />
            <Card.Content>
                <Card.Header>{profile.displayName}</Card.Header>
                <Card.Description>{profile.bio && profile.bio.length > 30 ? profile.bio.substring(0, 19) + '...' : profile.bio}</Card.Description>
            </Card.Content>
            <Card.Content>
                <Icon name='user' />
                20 Followers
            </Card.Content>
        </Card>
    );
})