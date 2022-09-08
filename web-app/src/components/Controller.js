
import { useEffect, useRef, useState } from 'react';
import { INPUT_TYPE, SEQUENCE_TYPE } from '../models/experiment';
import { Navigator } from './Navigator';
import { Questionnaire } from './Questionnaire';
import { UI } from './UI';
import { Timer } from './Timer';

import useStore from '../services/store';

export function Controller() {

    const experiment = useStore(state => state.experiment);
    const stateActions = useStore(state => state.stateActions);
    const completed = useStore(state => state.completed);
    const mouseMovement = useRef(0);
    const [progressPercent, setProgressPercent] = useState(-1);
    const progress = useRef(0);

    useEffect(() => {

        // start experiment
        stateActions.init();

        const activeIdSubscriber = useStore.subscribe(state => state.activeId, (current, prev) => {
            if (current) activeChanged(current);
        });

        return () => {
            activeIdSubscriber();
        }

    }, [])

    const onTimerComplete = () => {
        stateActions.increment();
    }

    const onTimerTic = (ms) => {
        // TODO: Use this?
    }

    const activeChanged = (id) => {
        console.log('Active id changed: ' + id);


        const stepIdx = useStore.getState().stepIdx;
        const sequence = experiment.steps[stepIdx].sequences[useStore.getState().sequenceIdx]
        if (sequence.type === SEQUENCE_TYPE.INPUT) {
            configureInput(sequence);
        }



    }

    const configureInput = ({ input }) => {
        switch (input) {
            case INPUT_TYPE.MOUSE:
                mouseMovement.current = 0;
                document.addEventListener('mousemove', controllerOnMouseMove, false);
                break;
            case INPUT_TYPE.ROTATION_SPEED:
            case INPUT_TYPE.SPEED:
                window.addEventListener('keydown', controllerOnKeyDown, false);
                break;
            default:
                break;
        }
    }

    // mouse move takes a certain amount of delta before it triggers the next state
    const controllerOnMouseMove = (event) => {
        mouseMovement.current++;
        setProgressPercent(parseInt(mouseMovement.current / experiment.settings.mousePixelThreshold * 100));
        if (mouseMovement.current >= experiment.settings.mousePixelThreshold) {
            document.removeEventListener('mousemove', controllerOnMouseMove);
            setProgressPercent(-1);
            stateActions.increment();
        }
    }

    // TODO: Enrichen? Require more than a single valid input?
    const controllerOnKeyDown = (event) => {
        let inputEntered = false;
        
        const stepIdx = useStore.getState().stepIdx;
        const sequence = experiment.steps[stepIdx].sequences[useStore.getState().sequenceIdx];

        switch (sequence.input) {
            case INPUT_TYPE.ROTATION_SPEED:
                if (
                    event.keyCode === 37 || // left
                    event.keyCode === 39) // right
                    progress.current += 1;
                    setProgressPercent(parseInt(progress.current / experiment.settings.arrowThreshold * 100)); 
                    if (progress.current >= experiment.settings.arrowThreshold) inputEntered = true;
                    
                break;

            case INPUT_TYPE.SPEED:
                if (event.keyCode === 38 || // up
                    event.keyCode === 40) // down
                    progress.current += 1;
                    setProgressPercent(parseInt(progress.current / experiment.settings.arrowThreshold * 100)); 
                    if (progress.current >= experiment.settings.arrowThreshold) inputEntered = true;
                break;
            default:
                break;
        }

        if (inputEntered) { // remove listener and move to the next state
            window.removeEventListener('keydown', controllerOnKeyDown);
            setTimeout(() => {
                progress.current = 0;
                setProgressPercent(-1);
                stateActions.increment();
            }, sequence.delay)

        }
    }

    return (
        <>
            {!completed && <>
                <Navigator />
                <Timer complete={onTimerComplete} reportCurrent={onTimerTic} />
            </>}
            {completed && <Questionnaire />}
            <UI progress={progressPercent}/>
        </>);

}

export default Controller;