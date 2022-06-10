import { FormControl, RadioGroup, FormControlLabel, Radio, Button, Box, TextField } from '@mui/material';
import '../styles/intro.css';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import parse from 'html-react-parser';
import { randomInt } from '../utilities/rng';


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

    const [values, setValues] = useState({ consent: '' });

    const [optedIn, setOptedIn] = useState(null);

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
        if (values.consent === 'true') { 
            setOptedIn(true);
        };
        if (values.consent === 'false') setOptedIn(false);

    }

    const onComplete = () => {
        complete(randomInt(100000000, 199999999)); // generate random 9-digit number
    }


    return (
        <div className="intro">
            {optedIn === null && <form onSubmit={handleSubmit(onSubmit)} className="consent-form">
                <div>{parse(settings?.consent)}</div>
                <FormControl>
                    <RadioGroup
                        aria-labelledby="controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={values.consent}
                        onChange={(event) => handleChange({ ...values, consent: event.target.value })}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="I consent to participate in this study" />
                        <FormControlLabel value="false" control={<Radio />} label="I do not consent to participate in this study" />
                    </RadioGroup>
                </FormControl>
                {/* <TextField
                        autofill="false"
                        placeholder="Prolific ID"
                        name="id"
                        label="Prolific ID"
                        required
                        {...register('id')}
                        error={errors.id ? true : false}
                        helperText={errors.id?.message}
                        value={values.id}
                        onChange={(event) => handleChange({ ...values, id: event.target.value })}
                    /> */}
                <Button variant="outlined" onClick={onSubmit} className="submitBtn" size="large">Submit</Button>


            </form>}
            { optedIn === true && <div className="content-form">
            <div className="content">{settings?.content}</div>
            <Button variant="outlined" onClick={onComplete} className="startBtn" size="large">Start</Button>
            </div> }
            { optedIn === false &&
                <div className="opt-out">
                    Thank you for your interest! You have decided not to participate in this study. (Go ahead and close this window)
                </div>
            }
        </div>


    );

}

export default Intro;