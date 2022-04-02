

export const RESPONSE_TYPE = {
    ESTIMATE: "ESTIMATE", // Provide a response estimate 
    EXECUTE: "EXECUTE", // Provide an execute response
    NEXT: "NEXT", // Provide a confirm button
    REPEAT_CONTINUE: "REPEAT_CONTINUE", // Provide a yes/no button, returning to previous state if no
    NONE: "NONE", // Do not provide any inputs
    SAMPLE: "SAMPLE", // Provide a read-only sample for the user
    SURVEY: "SURVEY", // Embed a survey form
    SKIP: "SKIP", // Skip past the response (for ad-hoc sequence chains)
}

export const ACTION = {
    DO_NOTHING: "DO_NOTHING",
    GO_NEXT: "GO_NEXT",
    RESTART_TASK: "RESTART_TASK",
    START_TASK: "START_TASK",
    START_TASK_SEQUENCE: "START_TASK_SEQUENCE",
    START_TASK_SUBSEQUENCE: "START_TASK_SUBSEQUENCE"
}