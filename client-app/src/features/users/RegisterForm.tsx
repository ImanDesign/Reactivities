import { ErrorMessage, Form, Formik } from "formik";
import MyTextInput from "../../app/common/form/MyTextInput";
import { Button, Header } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup'
import ValidationError from "../errors/ValidationError";

export default function RegisterForm() {
    const {userStore} = useStore();
    
    return(
        <Formik
            initialValues={{displayName: '', username: '', email: '', password: '', error: null}}
            onSubmit={(values, {setErrors}) => userStore.register(values).catch(error => setErrors({error}))}
            validationSchema={Yup.object({
                displayName: Yup.string().required(), 
                username: Yup.string().required(), 
                email: Yup.string().required(), 
                password: Yup.string().required(), 
            })}
        >
            {({handleSubmit, isSubmitting, dirty, isValid, errors}) => (
                <Form className="ui form error" onSubmit={handleSubmit} autoComplete="off">
                    <Header as='h2' content='Sign up to Reactivities' color="teal" textAlign="center" />
                    <MyTextInput name="displayName" placeholder="Display name" />
                    <MyTextInput name="username" placeholder="Username" />
                    <MyTextInput name="email" placeholder="Email" />
                    <MyTextInput type='password' name="password" placeholder="Password" />
                    <ErrorMessage 
                        name='error'
                        render={() => <ValidationError errors={errors.error} /> }
                    />
                    <Button 
                        type="submit" 
                        disabled={!isValid || !dirty || isSubmitting}
                        loading={isSubmitting} 
                        content='Register'
                        positive fluid />
                </Form>
            )}
        </Formik>
    )
}