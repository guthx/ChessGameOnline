import React from 'react';
import Timer from './Board/Timer';
import MoveHistory from './MoveHistory';
import { Color } from '../enums';

function RightMenu(props) {
    if (props.color === Color.BLACK)
        return (
            <div className={'right-menu'}>
                <Timer time={props.whiteTime / 1000} highlight={props.toMove === Color.WHITE} />
                <MoveHistory 
                    moveHistory={props.moveHistory}
                    viewState={props.viewState}
                />
                <Timer time={props.blackTime / 1000} highlight={props.toMove === Color.BLACK} />
            </div>
        );
    else
        return (
            <div className={'right-menu'}>
                <Timer time={props.blackTime / 1000} highlight={props.toMove === Color.BLACK} />
                <MoveHistory
                    moveHistory={props.moveHistory}
                    viewState={props.viewState}
                />
                <Timer time={props.whiteTime / 1000} highlight={props.toMove === Color.WHITE} />
            </div>
        );
}

export default RightMenu;