
import { useState } from 'react';
// TODO: Dynamically import
import experimentSource from '../experiments/browser.json';
import { ACTION } from '../models/experiment';



export const getNextStep = (allSteps, currentStepIdx) => {
    if (currentStepIdx < allSteps.length-1) return allSteps[currentStepIdx+1];
    return null; // no more steps
}

export const getNextSequence = (allSequences, currentSequenceIdx) => {
    if (currentSequenceIdx < allSequences.length) return allSequences[currentSequenceIdx+1];
    return null; // no more steps
}



