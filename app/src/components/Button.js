import '../styles/button.css';
import React, { useEffect, useState, useRef } from 'react';

const Button = () => {

    

    return (<button className={`
        ${shouldHide ? 'hidden' : ''}

    `} onClick={buttonClicked}>{text}</button>)

}

export { Button };
