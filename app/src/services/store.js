import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import fullExperimentSrc from '../experiments/full.json';
import limitedExperimentSrc from '../experiments/limited.json';
import { STEP_TYPE, SEQUENCE_TYPE } from '../models/experiment';
import { getNextStep, getNextSequence } from '../services/experiment';
import { initializeApp } from 'firebase/app';
// import 'firebase/firestore';
import { getFirestore, serverTimestamp, collection, doc, addDoc, getDoc, getDocs, setDoc } from 'firebase/firestore/lite';
import firebaseConfig from '../settings/firebase-config';
import { randomInt } from '../utilities/rng';
import { async } from '@firebase/util';


const useStore = create(subscribeWithSelector(((set,get) => {

    const db = getFirestore(initializeApp(firebaseConfig));
    const participantId = randomInt(1000000000, 1999999999);

    const createLog = async (experimentSrc) => {        
        
        const session = {
            createdAt: serverTimestamp(),
            experimentId: experimentSrc.id
        };

        const experimentRef = await doc(db, "Experiments", experimentSrc.id);
        const experimentSnap = await getDoc(experimentRef);
        
        if (experimentSnap.exists()) {
            console.log(experimentSnap.data());
            await setDoc(doc(experimentRef, "Participants", participantId.toString()), session);
            console.log("Creating participant log...", session);

            const conditionSnap = await getDoc(db, "Experiments", experimentSrc.id, "Condition");
            if (!conditionSnap.exists()) { await setDoc(doc(experimentRef, "Condition", )) }

         }          
        
        
    }

    return {
        initializeExperiment: async () => {
         
            let experimentSrc = null;
            const conditionRef = doc(db, "Settings", "Condition");
            const conditionSnap = await getDoc(conditionRef);
            const { id } = conditionSnap.data();

            // TODO: Make more robust? -- right now it just alternates
            if (id === "full") {
                experimentSrc = fullExperimentSrc;
                await setDoc(conditionRef, { id: "limited" });
            } else {
                experimentSrc = limitedExperimentSrc;
                await setDoc(conditionRef, { id: "full" });
            }
            
            set({experiment: experimentSrc});
            set({seed: experimentSrc.settings.startingSeed})
            await createLog(experimentSrc);
            set({initialized: true});
        },
        initialized: false,
        participantId: participantId,
        timerSpeed: 1, // set to change how fast/slow time passes
        activeId: null, // id of active step/sequence
        incrementSeed: () => { set(state => ({seed: state.seed + 1}))},
        navigator: {
            speed: 0, // initial navigator settings -- get set by each step
            rotationSpeed: 0,
        },
        setNavigator: (navigator) => { set(state => ({navigator: navigator}))}, 
        stepIdx: -1,
        sequenceIdx: -1,
        stateActions: { 
            init() {
                initializeState(get(), set)
            },
            increment() {
                changeState(get(), set);
            }
        },
        timerDuration: -1,
        setTimerDuration: (duration) => set({timerDuration: duration}),
        db: db
     }
})));   

const initializeState = (state, set) => {
    console.log('Initializing state...');
    const firstStep = state.experiment.steps[0];
    const firstSequence = firstStep.sequences[0];
    set(state => ({navigator: {...state.navigator, speed: firstStep.settings.speed, rotationSpeed: firstStep.settings.rotationSpeed}}));
    set(() => ({stepIdx: 0}));
    set(() => ({sequenceIdx: 0}));
    switch (firstSequence.type) {
        case SEQUENCE_TYPE.TIMED:
            state.setTimerDuration(firstSequence.duration);
            break;
        case SEQUENCE_TYPE.INPUT:
            state.setTimerDuration(-1);
            break;
        default:
            break;   
    }
    set(() => ({activeId: firstStep.id}));
}

const changeState = (state, set) => {
    const step = state.experiment.steps[state.stepIdx];

    let newSequence = null;
    let newStep = null;

    switch(step.type) {
        case (STEP_TYPE.TRAINING):
        case (STEP_TYPE.OUTRO):
            newSequence = changeSequence(state, set);
            if (!newSequence) {
                newStep = changeStep(state, set);
            }
            break;
        case (STEP_TYPE.NAVIGATOR):
            newStep = changeStep(state, set);
            break;
        default: 
           break; 
    }

    if (newSequence) set(() => ({activeId: newSequence.id}));
    if (newStep) set(() => ({activeId: newStep.id}));

    if (!newSequence && !newStep) { 
        console.log('No more steps or sequences -- done with experiment');
    } else {
        console.log('State changed');
    }

}

const changeStep = (state, set) => {
    const nextStep = getNextStep(state.experiment.steps, state.stepIdx);
    if (nextStep) { 
        set(state => ({stepIdx: state.stepIdx + 1}));
        state.setTimerDuration(nextStep.duration);
        set(state => ({navigator: {...state.navigator, speed: nextStep.settings.speed, rotationSpeed: nextStep.settings.rotationSpeed}}));
        console.log('Step changed: ' + nextStep.id);
        return nextStep;
    };
    if (!nextStep) { 
        return null;
    }
    set({sequenceIdx: -1});
}

const changeSequence = (state, set) => {
    const step = state.experiment.steps[state.stepIdx];
    const nextSequence = getNextSequence(step.sequences, state.sequenceIdx);
    if (nextSequence) {
        set(state => ({sequenceIdx: state.sequenceIdx + 1}));
        switch (nextSequence.type) {
            case SEQUENCE_TYPE.TIMED:
                state.setTimerDuration(nextSequence.duration);
                break;
            case SEQUENCE_TYPE.INPUT:
                state.setTimerDuration(-1);
                break;
            default:
                break;   
        }
        console.log('Sequence changed: ' + nextSequence.id);
        return nextSequence;
    }
    if (!nextSequence) { 
        console.log('No more sequences--trying next step');
        return null;
    };
}

  export default useStore;

  