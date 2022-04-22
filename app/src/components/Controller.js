
import { useEffect, useRef, useState } from 'react';
import { STEP_TYPE, SEQUENCE_TYPE, INPUT_TYPE } from '../models/experiment';
import { Navigator } from './Navigator';
import { UI } from './UI';
import { getNextStep, getNextSequence } from '../services/experiment';

export function Controller({ useStore }) {

    const experiment = useStore(state => state.experiment);
    
    const incrementStepIdx = useStore(state => state.incrementStepIdx);
    const stepIdx = useStore(state => state.stepIdx);
    const sequenceIdx = useStore(state => state.sequenceIdx);
    const incrementSequenceIdx = useStore(state => state.incrementSequenceIdx);
    const resetSequenceIdx = useStore(state => state.resetSequenceIdx);
    const setSpeed = useStore(state => state.setSpeed);
    const setRotationSpeed = useStore(state => state.setRotationSpeed);
    const timerSpeed = useStore(state => state.timerSpeed);
    const timerDuration = useStore(state => state.timerDuration);
    const setTimerDuration = useStore(state => state.setTimerDuration);
    

    const [ms, setMs] = useState(0);
    const mouseMovement = useRef(0);

    


    const interval = useRef(null);

    useEffect(() => {
        // start experiment
        startCounter();
        // const step = experiment.steps[stepIdx];
        // setSpeed(step.settings.speed);
        // setRotationSpeed(step.settings.rotationSpeed);
        // setTimerDuration(step.settings.timerDuration);
        changeState();

       
            // useStore.subscribe(state => state.stepIdx, (stepIdx, _) => {

            //     configureStep();
            //     resetCounter();
            // });

        // setup input listeners

        

        return () => {

        }
        

    }, [])

    useEffect(() => {
        if (timerDuration <= 0) return;
        if (ms >= timerDuration) changeState();
    }, [ms])

    const changeState = () => {
        const step = experiment.steps[stepIdx];

        switch(step.type) {
            case (STEP_TYPE.TRAINING):
            case (STEP_TYPE.OUTRO):
                changeSequence();
                if (sequenceIdx < 0) changeStep();
                break;
            case (STEP_TYPE.NAVIGATOR):
                changeStep();
                break;
            default: 
                resetCounter();
                break;
        }
        console.log('State changed');
    }

    const changeStep = () => {
        const nextStep = getNextStep(experiment.steps, stepIdx);
        if (nextStep) { 
            incrementStepIdx();
            setTimerDuration(nextStep.duration);
            setSpeed(nextStep.settings.speed);
            setRotationSpeed(nextStep.settings.rotationSpeed);
            console.log('Step changed: ' + nextStep.id);
        };
        if (!nextStep) console.log('No more steps');
        resetSequenceIdx();
    }

    const changeSequence = () => {
        
        const nextSequence = getNextSequence(experiment.steps[stepIdx].sequences, sequenceIdx);
        if (nextSequence) {
            incrementSequenceIdx();
            switch (nextSequence.type) {
                case SEQUENCE_TYPE.TIMED:
                    setTimerDuration(nextSequence.duration);
                    break;
                case SEQUENCE_TYPE.INPUT:
                    setTimerDuration(-1);
                    configureInput(nextSequence);
                    break;
                default:
                    break;   
            }
            // set timerDuration if available, otherwise set to -1 (means the current state is untimed)
            setTimerDuration(nextSequence.duration ? nextSequence.duration : -1);
            console.log('Sequence changed: ' + nextSequence.id);
        }
        if (!nextSequence) { 
            console.log('No more sequences');
            resetSequenceIdx();
        };
    }

    const configureInput = ({type}) => {
        switch (type) {
            case INPUT_TYPE.MOUSE:
                mouseMovement.current = 0;
                document.addEventListener('mousemove', onMouseMove, false);
                break;
            case INPUT_TYPE.ROTATION_SPEED:
            case INPUT_TYPE.SPEED:
                window.addEventListener('keydown', onKeyDown, false);
                break;
            default:
                break;
        }
    }

    // mouse move takes a certain amount of delta before it triggers the next state
    const onMouseMove = (event) => {
        mouseMovement.current++;
        if (mouseMovement.current >= experiment.settings.mousePixelThreshold) {
            document.removeEventListener('mousemove', onMouseMove);
            console.log('Mouse movement > 300 pixels');
            changeState();
        }
    }

    // TODO: Enrichen? Require more than a single valid input?
    const onKeyDown = (event) => {
        let inputEntered = false;
        // hande up/down/left/right, wasd keys
        if (event.keyCode === 38 || event.keyCode === 87 || // up / w
        event.keyCode === 40 || event.keyCode === 83 || // down / s
        event.keyCode === 37 || event.keyCode === 65 || // left / a
        event.keyCode === 39 || event.keyCode === 68) // right / d
            inputEntered = true;
            
        if (inputEntered) { // remove listener and move to the next state
            window.removeEventListener('keydown', onKeyDown);
            changeState();
        }

    }



    const startCounter = () => interval.current = setInterval(() => {
        setMs(prevState => prevState + 100);

      }, 100 / timerSpeed); // once every 1/10 second, with optional offset for speeding the counter up
    
      const resetCounter = () => setMs(0.0);
      const stopCounter = () => clearInterval(interval.current);


    return (
    <>
        <Navigator useStore={useStore}/>
        <UI useStore={useStore}></UI>
    </>);
    
}

export default Controller;