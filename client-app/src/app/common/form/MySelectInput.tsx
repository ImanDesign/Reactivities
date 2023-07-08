import { useField } from "formik";
import { Form, Label, Select } from "semantic-ui-react";

interface Props {
    name: string;
    placeholder: string;
    options: any;
    label?: string;
}

export default function MySelectInput(props: Props) {
    const [field, meta, helpers] = useField(props.name);
    
    return (
        <Form.Field error={meta.touched && !!meta.error}>
            <label>{props.label}</label>
            <Select 
                clearable
                options={props.options}
                value={field.value || null}
                placeholder={props.placeholder}
                onChange={(event, data) => helpers.setValue(data.value)}
                onBlur={() => helpers.setTouched(true)}
            />
            {meta.touched && meta.error 
               ? <Label basic color="red">{meta.error}</Label>
               : null
            }
        </Form.Field>
    )
}