import { ErrorMessage, Form, Formik } from "formik";
import MyTextInput from "../../app/common/form/MyTextInput";
import { Button, Header, Label } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";

export default function LoginForm() {
    const {userStore} = useStore();
    
    return(
        <Formik
            initialValues={{email: '', password: '', error: null}}
            onSubmit={(values, {setErrors}) => userStore.login(values).catch(error => setErrors({error: 'Invalid email or password'}))}
        >
            {({handleSubmit, isSubmitting, errors}) => (
                <Form className="ui form" onSubmit={handleSubmit} autoComplete="off">
                    <Header as='h2' content='Login to Reactivities' color="teal" textAlign="center" />
                    <MyTextInput name="email" placeholder="Email" />
                    <MyTextInput type='password' name="password" placeholder="Password" />
                    <ErrorMessage 
                        name='error'
                        render={() => <Label style={{marginBottom: 10}} content={errors.error} basic color="red" /> }
                    />
                    <Button type="submit" loading={isSubmitting} content='Login' positive fluid />
                </Form>
            )}
        </Formik>
    )
}