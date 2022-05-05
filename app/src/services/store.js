import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import experimentSrc from '../experiments/browser.json';
import { STEP_TYPE, SEQUENCE_TYPE } from '../models/experiment';
import { getNextStep, getNextSequence } from '../services/experiment';
import firebase, { initializeApp } from 'firebase/app';
// import 'firebase/firestore';
import { getFirestore, serverTimestamp, collection, doc, getDoc, setDoc } from 'firebase/firestore/lite';
import firebaseConfig from '../settings/firebase-config';
import { randomInt } from '../utilities/rng';


const useStore = create(subscribeWithSelector(((set,get) => {

    const dbRoot = `Experiments/${experimentSrc.id}/Participants`;
    const db = getFirestore(initializeApp(firebaseConfig));
    const participantId = randomInt(1000000000, 1999999999);

    const fetchData = async () => {        
        //const participantsRef = db.collection(dbRoot);
        //const participantsRef = await getDocs(collection(db))
        
        const session = {
            createdAt: serverTimestamp(),
            experimentId: experimentSrc.id
        };

        const participantsRef = await doc(db, "Experiments", experimentSrc.id);
        const participantsSnap = await getDoc(participantsRef);
        if (participantsSnap.exists()) {
            await setDoc(doc(participantsRef, "Participants", participantId.toString()), session);
            console.log("Creating participant log...", session);
          } else {
            console.log("Could not create participant log!");
          }       
        
    }
      
    fetchData();


    return {
        experiment: experimentSrc,
        participantId: participantId,
        dbRoot: dbRoot,
        timerSpeed: 1, // set to change how fast/slow time passes
        activeId: null, // id of active step/sequence
        seed: experimentSrc.settings.startingSeed,
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

  