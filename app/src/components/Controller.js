
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
    console.log('completed?', completed);
    const mouseMovement = useRef(0);
    

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
        console.log('Active id changed: ' +  id);

        // check we're on a sequence chain, meaning input is a possibility
        const sequenceIdx = useStore.getState().sequenceIdx;
        if (sequenceIdx > -1) {
            const stepIdx = useStore.getState().stepIdx;
            const sequence = experiment.steps[stepIdx].sequences[sequenceIdx]
            if (sequence.type === SEQUENCE_TYPE.INPUT) {
                configureInput(sequence);
            } 
                
        }

    }

    const configureInput = ({input}) => {
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
        if (mouseMovement.current >= experiment.settings.mousePixelThreshold) {
            document.removeEventListener('mousemove', controllerOnMouseMove);
            console.log('Mouse movement > 300 pixels');
            stateActions.increment();
        }
    }

    // TODO: Enrichen? Require more than a single valid input?
    const controllerOnKeyDown = (event) => {
        let inputEntered = false;
        // hande up/down/left/right, wasd keys
        if (event.keyCode === 38 || // up / w
        event.keyCode === 40 || // down / s
        event.keyCode === 37 || // left / a
        event.keyCode === 39 ) // right / d
            inputEntered = true;
            
        if (inputEntered) { // remove listener and move to the next state
            window.removeEventListener('keydown', controllerOnKeyDown);
            stateActions.increment();
        }
    }

    return (
    <>
        { !completed && <>
            <Navigator />
            <Timer complete={onTimerComplete} reportCurrent={onTimerTic}/>
        </>}
        { completed && <Questionnaire /> }
        <UI /> 
    </>);
    
}

export default Controller;