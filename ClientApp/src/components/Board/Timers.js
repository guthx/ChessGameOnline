import React from 'react';
import Timer from './Timer';
import { Color } from '../../enums';

function Timers(props) {
    if (props.turnCount <= 0) {
        return (
            <div className={'timers-container'}>
                <Timer time={props.whiteTime / 1000} highlight={false} />
                <Timer time={props.blackTime / 1000} highlight={false} />
            </div>
        );
    }
    else if (props.color == Color.BLACK)
        return (
            <div className={'timers-container'}>
                <Timer time={props.whiteTime / 1000} highlight={props.toMove == Color.WHITE} />
                <Timer time={props.blackTime / 1000} highlight={props.toMove == Color.BLACK} />
            </div>
        );
    else
        return (
            <div className={'timers-container'}>
                <Timer time={props.blackTime / 1000} highlight={props.toMove == Color.BLACK} />
                <Timer time={props.whiteTime / 1000} highlight={props.toMove == Color.WHITE} />
            </div>
        );
}

export default Timers