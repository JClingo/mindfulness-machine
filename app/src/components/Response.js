
   
// import '../styles/response.css';
// import { ACTION, RESPONSE_TYPE } from '../models/experiment';
// import { useSharedExperiment } from '../services/experiment';
// import React, { useEffect, useState } from 'react';


// function Response(props) {

//   const { 
//     experiment, 
//     setAction, 
//     sequenceId, 
//     subsequenceId, 
//     adhocSubsequenceId } = useSharedExperiment();
//   const [responseForm, setResponseForm] = useState(<></>);
//   useEffect(() => {
//     let response;
//     // If we're in an adhoc subsequence, we want to render those components over the regular subsequences'
//     if (adhocSubsequenceId) {
//       response = experiment.responses.find(r => r.id === adhocSubsequenceId); 
//     } else {
//       response = experiment.responses.find(r => r.id === subsequenceId);
//     }

//     if (!response) {
//       setResponseForm(<></>);
//       return;
//     }

//     switch(response.type) {
      
//       case RESPONSE_TYPE.NEXT:
//         setResponseForm(<ResponseNext response={response} handleSubmit={(response) => handleSubmit(response)} />);
//         break;
//       case RESPONSE_TYPE.NONE: 
//         setResponseForm(<ResponseNone response={response} />);
//         break;
//       case RESPONSE_TYPE.SURVEY: 
//         setResponseForm(<ResponseSurvey response={response} userId={experiment.userId} />);
//         break;
//       case RESPONSE_TYPE.SKIP: 
//         setResponseForm(<ResponseSkip action={adhocSubsequenceId ? ACTION.END_ADHOC : ACTION.GO_NEXT} />);
//         break;
//       default: 
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps  
//   }, [subsequenceId, adhocSubsequenceId])

//   const handleSubmit = (userResponse) => {

    

//     switch(response.type) {
//       case RESPONSE_TYPE.NEXT:  
//         setAction(ACTION.GO_NEXT)
//         break;
//       default: 
//     }
//   } 


//   return (
//     <>
//       {responseForm}
//     </>);
// }

// export default Response;


// function ResponseNone({response}) {
//   const { content }  = response;
//   const { description } = content;
//   return (
//     <div className="response none">
//       <div>{description}</div>
//     </div>
  
//   );
// }

// function ResponseNext({response, handleSubmit}) {

//     const { content } = response;
//     const { description, submitLabel } = content;
//     return (
//       <div className="response next">
//         <div className="label">{description}</div>
//         <Button variant="outlined" size="large" disabled={response?.disabled ? response.disabled : false } onClick={() => handleSubmit({[response.id]: true })}>{submitLabel}</Button>
//       </div>
    
//     );
//   }

// function ResponseSurvey({response, userId}) {
//     const { content }  = response;
//     const { src } = content;
  
//     return (
//       <div className="response survey-container">
//         <div className="user-id-container">
//           <div className="label">Your 10-digit identifier is: {userId}</div></div>
//         <iframe title="survey" src={src} id="iframe" className="survey"></iframe>
//       </div>
      
//     )
//   }

//   function ResponseSkip({action}) {
//     const { setAction } = useSharedExperiment();
//     useEffect(() => {
//       if (action) { 
//         setAction(action);
//         console.log('Response - Skip - ' + action + ' called');
//       }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     },[])
    
//     return (<></>);
//   }