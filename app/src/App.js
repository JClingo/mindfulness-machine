import './App.css';
import { useEffect, useState } from 'react';
import Intro from './components/Intro';
import Controller from './components/Controller';
import useStore from './services/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {

  const initialized = useStore(state => state.initialized);
  const initializeExperiment = useStore(state => state.initializeExperiment);
  const [experiment, setExperiment] = useState(null);

  useEffect(() => {
    const fetchExperiment = async () => {
      const experiment = await import(`./experiments/${process.env.REACT_APP_EXPERIMENT}`);
      setExperiment(experiment);
  }

  fetchExperiment().catch(console.error);
  },[])

  const onCompleteIntro = (participantId) => {
    initializeExperiment(experiment, participantId);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      { experiment && <>
        { !initialized && <Intro settings={experiment.intro} complete={onCompleteIntro}/> }
        { initialized && <Controller/> }
      </>}
      
    </ThemeProvider>
  );
}

export default App;
