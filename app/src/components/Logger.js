import { useEffect, useRef, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore/lite';
import useStore from '../services/store';


export function Logger() {

    const experiment = useStore(state => state.experiment);
    const speed = useStore(state => state.timerSpeed);
    const db = useStore(state => state.db);
    
    const normedX = useRef(null);
    const normedY = useRef(null);

    const interval = useRef(null);
    const [ms, setMs] = useState(0);
    const stepId = useRef(null);
    const seed = useRef(useStore.getState().seed);

    useEffect(() => {

        document.addEventListener('mousemove', onDocumentMouseMove, false);

        startTimer();

        const stepIdxSubscriber = useStore.subscribe(state => state.stepIdx, (current, prev) => { 
            if (prev !== current) {
                stepId.current = experiment.steps[current].id;
                reset();
            }
        });

        const seedSubscriber = useStore.subscribe(state => state.seed, (current, prev) => {
            if (prev !== current) {
                seed.current = current;
            }
        })

        return () => {
            stepIdxSubscriber();
            seedSubscriber();
        }

    },[])

    useEffect(() => {
        if (stepId.current) logState();
    }, [ms])

    const logState = async () => {
        // get normalized cursor position (as a fraction of each x and y dimension)

        // grab navigator settings (speed and rotationSpeed)
        const navigator = useStore.getState().navigator;
        const participantId = useStore.getState().participantId;
        // grab stepId -- we want to be logging each step as its own record (no need to log sequences separately at this point)
        // 

        const record = {
            speed: navigator.speed,
            rotationSpeed: navigator.rotationSpeed,
            x: normedX.current,
            y: normedY.current,
            seed: seed.current,
            hueValues: navigator.hueValues
        }

        await setDoc(doc(db, "Experiments", experiment.id, "Participants", participantId.toString(), "Steps", stepId.current, "Timestep", ms.toString()), record);

    }

    const onDocumentMouseMove = (event) => {
        normedX.current = (event.clientX - window.innerWidth ) / (window.innerWidth) * 2 + 1; // normed, then shifted to -1 to 1
        normedY.current = (event.clientY - window.innerHeight ) / (window.innerHeight) * 2 + 1; // normed, then shifted to -1 to 1
    }

    const startTimer = () => interval.current = setInterval(() => {
        setMs(prevState => prevState + 1000);

      }, 1000 / speed); // once every 1 second, with optional offset for speeding the timer up
    
      const reset = () => setMs(0.0);

      return(<></>);

}

export default Logger;