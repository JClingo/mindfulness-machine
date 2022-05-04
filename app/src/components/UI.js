import '../styles/ui.css';
import { useEffect, useRef, useState } from 'react';
import { SEQUENCE_TYPE, INPUT_TYPE } from '../models/experiment';
import useStore from '../services/store';

export function UI() {

    const experiment = useStore(state => state.experiment);
    const steps = useStore(state => state.experiment).steps;
    const [display, setDisplay] = useState('');

    useEffect(() => {

        const activeIdSubscriber = useStore.subscribe(state => state.activeId, (current, prev) => { 
            const sequenceIdx = useStore.getState().sequenceIdx;
            if (sequenceIdx > -1) {
                const stepIdx = useStore.getState().stepIdx;
                const sequence = experiment.steps[stepIdx].sequences[sequenceIdx];
                setDisplay(sequence.display);
                return; 
            }   
            setDisplay('');      
        });

        return () => {
            activeIdSubscriber();
        }

    }, [])

   

    


    return (<div className="ui">{display}</div>);
    
}

export default UI;