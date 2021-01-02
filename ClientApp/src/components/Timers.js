import React from 'react';
import Timer from '../components/Timer';

function Timers(props) {
    if (props.turnCount <= 1) {
        return (
            <div className={'timers-container'}>
                <Timer time={props.whiteTime / 1000} highlight={false} />
                <Timer time={props.blackTime / 1000} highlight={false} />
            </div>
        );
    }
    else if (props.color == "BLACK")
        return (
            <div className={'timers-container'}>
                <Timer time={props.whiteTime / 1000} highlight={props.toMove == "WHITE"} />
                <Timer time={props.blackTime / 1000} highlight={props.toMove == "BLACK"} />
            </div>
        );
    else
        return (
            <div className={'timers-container'}>
                <Timer time={props.blackTime / 1000} highlight={props.toMove == "BLACK"} />
                <Timer time={props.whiteTime / 1000} highlight={props.toMove == "WHITE"} />
            </div>
        );
}

export default Timers