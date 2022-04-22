import '../styles/ui.css';
import { useEffect, useRef, useState } from 'react';
import { SEQUENCE_TYPE, INPUT_TYPE } from '../models/experiment';

export function UI({ useStore }) {

    const steps = useStore(state => state.experiment).steps;
    const [display, setDisplay] = useState('');
    const stepIdx = useStore(state => state.stepIdx);
    const sequenceIdx = useStore(state => state.sequenceIdx);


    useEffect(() => {
        if (sequenceIdx > -1) {
            const sequence = steps[stepIdx].sequences[sequenceIdx];
            setDisplay(sequence.display);
            return;
        }
        
        // otherwise, reset to blank
        setDisplay('');
        
           
    }, [sequenceIdx])

   

    


    return (<div className="ui">{display}</div>);
    
}

export default UI;