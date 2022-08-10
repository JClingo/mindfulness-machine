import '../styles/intro.css';
import { Button } from '@mui/material';
import { useState } from 'react';
import { randomInt } from '../utilities/rng';
import { deviceType } from '../utilities/device-type';

export function Intro({ settings, complete }) {

    const [passedDeviceCheck, setPassedDeviceCheck] = useState(deviceType() === 'desktop');

    const onComplete = () => {
        complete(randomInt(100000000, 199999999)); // generate random 9-digit number
    }

    return (
        <div className="intro-container">
            { passedDeviceCheck ?
                <>
                    <div className="screen">
                        Please expand your browser window to fullscreen!
                    </div>
                    <div className="intro">
                        <div className="content-form">
                            <div className="content">{settings?.content}</div>
                            <Button variant="outlined" onClick={onComplete} className="startBtn" size="large">Start</Button>
                        </div>
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