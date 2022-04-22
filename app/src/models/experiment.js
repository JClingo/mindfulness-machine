
export const STEP_TYPE = {
    TRAINING: "TRAINING", // training step
    NAVIGATOR: "NAVIGATOR", // main navigator step
    OUTRO: "OUTRO" // outro step
}

export const SEQUENCE_TYPE = {
    TIMED: "TIMED", // lasts until the given time has elapsed
    INPUT: "INPUT" // lasts until the user has fulfilled the input requirement for the sequence
}

export const INPUT_TYPE = {
    SPEED: "SPEED", // ws or up/down arrows
    ROTATION_SPEED: "ROTATION_SPEED", // ad or left/right arrows
    MOUSE: "MOUSE" // cursor movement
}