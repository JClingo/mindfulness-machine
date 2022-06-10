import '../styles/ui.css';
import { useEffect, useRef, useState } from 'react';
import { SEQUENCE_TYPE, INPUT_TYPE } from '../models/experiment';
import useStore from '../services/store';
import parse from 'html-react-parser';


export function UI() {

    const experiment = useStore(state => state.experiment);
    const steps = useStore(state => state.experiment).steps;
    const [display, setDisplay] = useState('');
    const [showControls, setShowControls] = useState(false);
    const [activeKeys, setActiveKeys] = useState({
        37: false, 
        38: false,
        39: false,
        40: false
    });

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

        const stepIdxSubscriber = useStore.subscribe(state => state.stepIdx, (current, prev) => { 
            const { canControl } = experiment.steps[current].settings;
            setShowControls(canControl);
        });

        window.addEventListener('keydown', uiOnKeyDown, false);
        window.addEventListener('keyup', uiOnKeyUp, false);

        return () => {
            activeIdSubscriber();
            stepIdxSubscriber();
            window.removeEventListener('keydown', uiOnKeyDown);
            window.removeEventListener('keyup', uiOnKeyUp);
        }

    }, [])

    const uiOnKeyUp = (event) => {

        activeKeys[event.keyCode] = false;
        setActiveKeys({...activeKeys});
        console.log('up', activeKeys);

    }

   

    const uiOnKeyDown = (event) => {

        activeKeys[event.keyCode] = true;
        setActiveKeys({...activeKeys});
        console.log('down', activeKeys);

        
    }


    return (<div className="ui">
        <div className="display">{parse(display)}</div>
        { showControls && <div className="controls">
        <div></div>
        <div className={`key ${activeKeys[38] ? 'active' : ''}`}>↑</div>
        <div></div>
        <div className={`key ${activeKeys[37] ? 'active' : ''}`}>←</div>
        <div className={`key ${activeKeys[40] ? 'active' : ''}`}>↓</div>
        <div className={`key ${activeKeys[39] ? 'active' : ''}`}>→</div>
        </div>}
    </div>);
    
}

export default UI;