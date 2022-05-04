import { useEffect, useRef, useState } from 'react';
import useStore from '../services/store';

export function Timer({reportCurrent, complete}) {

    const interval = useRef(null);
    const duration = useStore(state => state.timerDuration);
    const speed = useStore(state => state.timerSpeed);
    const [ms, setMs] = useState(0);

    useEffect(() => {
        startTimer();

        const activeIdSubscriber = useStore.subscribe(state => state.activeId, (current, prev) => { 
            if (current) reset();         
        });

        return () => {
            activeIdSubscriber();
        }

    },[])

    useEffect(() => {
        reportCurrent(ms);
        if (duration <= 0) return;
        if (ms >= duration) complete();
    }, [ms])

    const startTimer = () => interval.current = setInterval(() => {
        setMs(prevState => prevState + 100);

      }, 100 / speed); // once every 1/10 second, with optional offset for speeding the timer up
    
      const reset = () => setMs(0.0);
      const stop = () => clearInterval(interval.current);

      return(<></>);

}

export default Timer;