import './App.css';
import { useEffect } from 'react';
import Controller from './components/Controller';
import useStore from './services/store';

function App() {

  const initialized = useStore(state => state.initialized);
  const initializeExperiment = useStore(state => state.initializeExperiment);

  useEffect(() => {
    initializeExperiment();
  },[])



  return (
    <>
      { initialized && <Controller/> }
    </>
    
  );
}

export default App;
