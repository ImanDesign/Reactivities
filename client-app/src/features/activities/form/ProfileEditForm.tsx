import { observer } from "mobx-react-lite";
import { Button, Form } from "semantic-ui-react";
import { Profile } from "../../../app/models/profile";
import { useStore } from "../../../app/stores/store";
import MyTextInput from "../../../app/common/form/MyTextInput";
import { Formik } from "formik";
import * as Yup from 'yup';
import MyTextArea from "../../../app/common/form/MyTextArea";

interface Props {
    profile: Partial<Profile>;
    setEditMode: (editMode: boolean) => void;
}

export default observer(function ProfileEditForm({profile, setEditMode}: Props) {
    const {profileStore: {updateProfile}} = useStore();

    function handleFormSubmit(profile: Partial<Profile>) {
        updateProfile(profile).then(() => setEditMode(false));
    }

    const validationSchema = Yup.object({
        displayName: Yup.string().required('The DisplayName property is required'),
    });

    return (
        <Formik 
            validationSchema={validationSchema}
            enableReinitialize 
            initialValues={profile} 
            onSubmit={values => handleFormSubmit(values)}>
            {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                <Form className="ui form" onSubmit={handleSubmit} autoComplete='off'>
                    <MyTextInput name="displayName" placeholder="Display name" />
                    <MyTextArea name="bio" placeholder="Add your bio" rows={3} />
                    <Button 
                        disabled={isSubmitting || !dirty || !isValid}
                        loading={isSubmitting} 
                        floated="right" 
                        positive type="submit" content='Update' />
                </Form>
            )}
        </Formik>  
    );
})