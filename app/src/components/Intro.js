import { Button, Box, TextField } from '@mui/material';
import '../styles/intro.css';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";


// TODO: Work out validation

export function Intro({ settings, complete }) {

    const schema = yup.object().shape({
        id: yup.string()
            .required('User ID is required')
            .min(6, 'User ID must be at least 6 characters')
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const [content, setContent] = useState('');
    const [values, setValues] = useState({ id: '' });

    const handleChange = (value) => {
        setValues(value);
    };

    // useEffect(() => {
    //     const fetchExperiment = async () => {
    //         const experiment = await import(`../experiments/${process.env.REACT_APP_EXPERIMENT}`);
    //         setContent(experiment.intro.content);
    //     }

    //     fetchExperiment().catch(console.error);



    // }, [])

    const onSubmit = () => {
        console.log(errors);
        complete(values.id);
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="intro">
            <Box>
                <div>
                    <div>{settings?.content}</div>
                    <TextField
                        placeholder="Prolific ID"
                        name="id"
                        label="Prolific ID"
                        required
                        {...register('id')}
                        error={errors.id ? true : false}
                        helperText={errors.id?.message}
                        value={values.id}
                        onChange={(event) => handleChange({ ...values, id: event.target.value })}
                    />
                    <Button variant="outlined" onClick={onSubmit}>Submit</Button>
                </div>
            </Box>

        </form>

    );

}

export default Intro;