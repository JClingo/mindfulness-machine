
import { useEffect, useRef, useState } from 'react';
import { INPUT_TYPE } from '../models/experiment';
import { Navigator } from './Navigator';
import { UI } from './UI';
import { Timer } from './Timer';

import useStore from '../services/store';

export function Controller() {

    const experiment = useStore(state => state.experiment);
    const stateActions = useStore(state => state.stateActions);    
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
            const sequenceType = experiment.steps[stepIdx].sequences[sequenceIdx].type;
            configureInput(sequenceType);  
        }

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
            stateActions.increment();
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
            stateActions.increment();
        }

    }


    return (
    <>
        <Navigator />
        <UI />
        <Timer complete={onTimerComplete} reportCurrent={onTimerTic}/>
    </>);
    
}

export default Controller;