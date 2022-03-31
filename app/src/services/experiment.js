
import { useState } from 'react';
// TODO: Dynamically import
import experimentSource from '../experiments/vr.json';
import { ACTION } from '../models/experiment';



// use environmental config setting to dynamically load the correct experiment settings file
const FetchExperiment = () => {

    const startStep = experimentSource.steps[0];
    
    
    return experimentSource;
}

