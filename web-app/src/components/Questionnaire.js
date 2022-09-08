import '../styles/questionnaire.css';
import { useEffect, useRef, useState } from 'react';
import useStore from '../services/store';

export function Questionnaire() {

    const experiment = useStore(state => state.experiment);

    return(<iframe allow="encrypted-media" frameBorder="0" className="questionnaire" src={experiment.surveyUrl}></iframe>);

}

export default Questionnaire;