import './App.css';
import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'
import Controller from './components/Controller';


import experimentSrc from './experiments/browser.json';


function App() {

  const useStore = create(subscribeWithSelector(set => ({
    experiment: experimentSrc,
    stepIdx: 0,
    incrementStepIdx: () => set(state => ({step: state.step + 1})),
    sequenceIdx: -1,
    incrementSequenceIdx: () => set(state => ({sequenceIdx: state.sequenceIdx + 1})),
    resetSequenceIdx: () => set(() => ({sequenceIdx: -1})),
    seed: experimentSrc.settings.startingSeed,
    incrementSeed: () => set(state => ({seed: state.seed + 1})),
    speed: 0, // initial navigator settings -- get set by each step
    setSpeed: (speed) => set({speed: speed}),
    rotationSpeed: 0,
    setRotationSpeed: (speed) => set({rotationSpeed: speed}),
    timerSpeed: 1, // set to change how fast/slow time passes
    timerDuration: -1,
    setTimerDuration: (duration) => set({timerDuration: duration})
  })));



  return (
    <>
      <Controller useStore={useStore}/>
    </>
    
  );
}

export default App;
