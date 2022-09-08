import '../styles/button.css';
import React, { useEffect, useState, useRef } from 'react';

const VRButton = ({ setVRSession, endVRSession }) => {

    const [text, setText] = useState('ENTER VR');
    const [shouldHide, setShouldHide] = useState(false);
    // const [shouldDisable, setShouldDisable] = useState(false);
    let xrSessionIsGranted = useRef(false);
    let currentSession = useRef(null);

    useEffect(() => {      
            if ('xr' in navigator) {
                navigator.xr.addEventListener('sessiongranted', () => {
                    xrSessionIsGranted.current = true;
                    console.log('WEBXR granted');
                });
            }
    }, [])

    // useEffect(() => {
    //     if (xrSessionIsGranted.current && 'xr' in navigator) {
    //         navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
    
    //             if (supported) {
    //                 startSession();
    //             } else {
    //                 showWebXRNotFound()
    //             }
    
    //         }).catch(showVRNotAllowed);
    
    //     } else {
    //        console.log('WEBXR not granted');
    //     }
    // },[xrSessionIsGranted, startSession])

    const onSessionStarted = async (session) => {

        session.addEventListener('end', onSessionEnded);

        //await renderer.xr.setSession(session);
        await setVRSession(session)
        setText('EXIT VR');

        currentSession.current = session;

    }

    const onSessionEnded = ( /*event*/) => {

        currentSession.current.removeEventListener('end', onSessionEnded);

        setText('ENTER VR');

        currentSession.current = null;

        setShouldHide(false);

        endVRSession(currentSession)

        // TODO: Tell App we've exited the VR session
        //freeResources();

    }

    //

    // const showWebXRNotFound = () => {
    //     setShouldDisable(true);

    //     setText('VR NOT SUPPORTED');

    // }

    // const showVRNotAllowed = (exception) => {

    //     setShouldDisable(true);

    //     console.warn('Exception when trying to call xr.isSessionSupported', exception);

    //     setText('VR NOT ALLOWED');

    // }


    const buttonClicked = (event) => {
       startSession();
    }

    const startSession = () => {
        if (currentSession.current === null) {

            // WebXR's requestReferenceSpace only works if the corresponding feature
            // was requested at session creation time. For simplicity, just ask for
            // the interesting ones as optional features, but be aware that the
            // requestReferenceSpace call will fail if it turns out to be unavailable.
            // ('local' is always available for immersive sessions and doesn't need to
            // be requested separately.)

            const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] };
            navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
            setShouldHide(true); 

        }
    }

    return (<button className={`
        ${shouldHide ? 'hidden' : ''}

    `} onClick={buttonClicked}>{text}</button>)

}

export { VRButton };
