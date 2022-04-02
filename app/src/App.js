import './App.css';
import Navigator from './components/Navigator';
import create from 'zustand';


import experimentSrc from './experiments/browser.json';


function App() {

  const useStore = create(set => ({
    experiment: experimentSrc,
    seed: experimentSrc.settings.startingSeed,
    incrementSeed: () => set(state => ({seed: state.seed + 1}))
  }));

  return (
    <Navigator useStore={useStore}/>
  );
}

export default App;
