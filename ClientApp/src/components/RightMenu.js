import React from 'react';
import Timer from './Board/Timer';
import MoveHistory from './MoveHistory';
import { Color } from '../enums';

function RightMenu(props) {
    if (props.color === Color.BLACK)
        return (
            <div className={'right-menu'}>
                <Timer
                    time={props.whiteTime / 1000}
                    highlight={props.toMove === Color.WHITE && props.turnCount > 1 && props.gameResult == "ACTIVE"}
                />
                <MoveHistory 
                    moveHistory={props.moveHistory}
                    viewState={props.viewState}
                />
                <Timer
                    time={props.blackTime / 1000}
                    highlight={props.toMove === Color.BLACK && props.gameResult == "ACTIVE"}
                />
            </div>
        );
    else
        return (
            <div className={'right-menu'}>
                <Timer
                    time={props.blackTime / 1000}
                    highlight={props.toMove === Color.BLACK && props.gameResult == "ACTIVE"}
                />
                <MoveHistory
                    moveHistory={props.moveHistory}
                    viewState={props.viewState}
                />
                <Timer
                    time={props.whiteTime / 1000}
                    highlight={props.toMove === Color.WHITE && props.turnCount > 1 && props.gameResult == "ACTIVE"}
                />
            </div>
        );
}

export default RightMenu;