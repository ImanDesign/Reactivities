import { observer } from "mobx-react-lite";
import {Card, Header, Tab, Image, Grid, Button} from 'semantic-ui-react';
import { Photo, Profile } from "../../app/models/profile";
import { useStore } from "../../app/stores/store";
import { useState, SyntheticEvent } from "react";
import PhotoUploadWidget from "../../app/common/imageUpload/PhotoUploadWidget";

interface Props {
    profile: Profile;
}

export default observer(function ProfilePhotos({profile}: Props) {
    const {profileStore: {isCurrentUser, uploadPhoto, setMainPhoto, deletePhoto, uploadingPhoto, loading}} = useStore();
    const [addPhotoMode, setAddPhotoMode] = useState(false);
    const [target, setTarget] = useState('');

    function handleUploadPhoto(file: Blob) {
        uploadPhoto(file).then(() => setAddPhotoMode(false));
    }

    function handleSetMainPhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
        setTarget(e.currentTarget.name);
        setMainPhoto(photo);
    }

    function handleDeletePhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
        setTarget(e.currentTarget.name);
        deletePhoto(photo);
    }

    return(
        <Tab.Pane>
            <Grid>
                <Grid.Column width={16}>
                    <Header floated="left" icon='image' content='photos' />
                    {isCurrentUser ? (
                        <Button 
                            floated='right' 
                            basic 
                            content={addPhotoMode ? 'Cancel' : 'Add new photo'}
                            onClick={() => setAddPhotoMode(!addPhotoMode)} />
                    ) : null}
                </Grid.Column>
                <Grid.Column width={16}>
                    {addPhotoMode ? (
                        <PhotoUploadWidget uploadPhoto={handleUploadPhoto} uploading={uploadingPhoto} />
                    ) : (
                        <Card.Group itemsPerRow={5}>
                            {profile.photos?.map(photo => 
                                <Card key={photo.id}>
                                    <Image src={photo.url || '/assets/user.png'} />
                                    {isCurrentUser && (
                                        <Button.Group widths={2} fluid>
                                            <Button 
                                                basic
                                                color="green"
                                                content='Main'
                                                name={'main' + photo.id}
                                                loading={target === 'main' + photo.id && loading}
                                                disabled={photo.isMain}
                                                onClick={e => handleSetMainPhoto(photo, e)}
                                            />
                                            <Button 
                                                basic
                                                color="red"
                                                icon='trash'
                                                name={photo.id}
                                                loading={target === photo.id && loading}
                                                disabled={photo.isMain}
                                                onClick={e => handleDeletePhoto(photo, e)}
                                            />
                                        </Button.Group>
                                    )}
                                </Card>
                            )}
                        </Card.Group>
                    )}
                </Grid.Column>
            </Grid>
            
        </Tab.Pane>
    )
})