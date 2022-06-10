import '../styles/ui.css';
import { useEffect, useRef, useState } from 'react';
import { SEQUENCE_TYPE, INPUT_TYPE } from '../models/experiment';
import useStore from '../services/store';
import parse from 'html-react-parser';

export function UI() {

    const experiment = useStore(state => state.experiment);
    const completed = useStore(state => state.completed);
    const participantId = useStore(state => state.participantId);
    const [display, setDisplay] = useState('');
    const [showControls, setShowControls] = useState(false);
    const [activeKeys, setActiveKeys] = useState({
        37: false, // left
        38: false, // up
        39: false, // right
        40: false  // down
    });

    useEffect(() => {

        const activeIdSubscriber = useStore.subscribe(state => state.activeId, (current, prev) => {
            const sequenceIdx = useStore.getState().sequenceIdx;
            const stepIdx = useStore.getState().stepIdx;
            const sequence = experiment.steps[stepIdx].sequences[sequenceIdx];
            setDisplay(sequence.display);
            return;
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
        setActiveKeys({ ...activeKeys });
    }

    const uiOnKeyDown = (event) => {
        activeKeys[event.keyCode] = true;
        setActiveKeys({ ...activeKeys });
    }

    return (<div className="ui">
        {completed && <div className="completed">
            {participantId}
        </div>}
        {!completed && <>
            <div className="display">{parse(display)}</div>
            {showControls && <div className="controls">
                <div></div>
                <div className={`key ${activeKeys[38] ? 'active' : ''}`}>↑</div>
                <div></div>
                <div className={`key ${activeKeys[37] ? 'active' : ''}`}>←</div>
                <div className={`key ${activeKeys[40] ? 'active' : ''}`}>↓</div>
                <div className={`key ${activeKeys[39] ? 'active' : ''}`}>→</div>
            </div>}
        </>
        }
    </div>);

}

export default UI;