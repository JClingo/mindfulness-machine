import { FormControl, RadioGroup, FormControlLabel, Radio, Button, Box, TextField } from '@mui/material';
import '../styles/intro.css';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import parse from 'html-react-parser';
import { randomInt } from '../utilities/rng';
import { deviceType } from '../utilities/device-type';

export function Intro({ settings, complete }) {

    const schema = yup.object().shape({
        id: yup.string()
            .required('User ID is required')
            .min(6, 'User ID must be at least 6 characters')
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const [passedDeviceCheck, setPassedDeviceCheck] = useState(deviceType() === 'desktop');

    const [values, setValues] = useState({ consent: '' });

    const [optedIn, setOptedIn] = useState(null);

    const handleChange = (value) => {
        setValues(value);
    };

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
        <div className="intro-container">
            {passedDeviceCheck ?
                <>
                    <div className="screen">
                        Please expand your browser window to fullscreen!
                    </div>
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
                            <Button variant="outlined" onClick={onSubmit} className="submitBtn" size="large">Submit</Button>
                        </form>}
                        {optedIn === true && <div className="content-form">
                            <div className="content">{settings?.content}</div>
                            <Button variant="outlined" onClick={onComplete} className="startBtn" size="large">Start</Button>
                        </div>}
                        {optedIn === false &&
                            <div className="opt-out">
                                Thank you for your interest! You have decided not to participate in this study. (Go ahead and close this window)
                            </div>
                        }
                    </div>

                </>

                : <div className="incorrect-device">
                    This study can only run on devices with a keyboard and pointing device.<br />
                    If you would still like to participate, please access the study on a <strong>desktop</strong> or <strong>laptop</strong>.
                </div>}



        </div>


    );

}

export default Intro;