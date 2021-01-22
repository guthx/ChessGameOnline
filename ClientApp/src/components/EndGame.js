import React from 'react';
import { DialogTitle, Dialog } from '@material-ui/core';
import { rematchStates } from '../enums';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

function EndGame({
    gameResult,
    rematchState,
    checkmate,
    respondRematch
}) {

    let message;
    let rematchComponent;
    switch (gameResult) {
        case "WHITE_WIN":
            message = "White wins";
            break;
        case "BLACK_WIN":
            message = "Black wins";
            break;
        case "DRAW":
            message = "Draw";
            break;
        case "STALEMATE":
            message = "Stalemate";
            break;
        default:
            message = "Unknown game result"
            break;
    }
    switch (rematchState) {
        case rematchStates.NEUTRAL:
            rematchComponent = (
                <div id={'rematch'}>
                    <div id={'rematch-text'}>
                        Rematch?
                        </div>
                    <div id={'rematch-buttons'}>
                        <button
                            class={'game-button accept-button'}
                            onClick={() => respondRematch(true)}>
                            <CheckIcon />
                        </button>
                        <button
                            class={'game-button decline-button'}
                            onClick={() => respondRematch(false)}>
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            );
            break;
        case rematchStates.AWAITING:
            rematchComponent = (
                <div id={'rematch'}>
                    <div id={'rematch-text'}>
                        Awaiting opponent...
                        </div>
                    <div id={'rematch-buttons'}>
                        <button
                            class={'game-button accept-button pending'}
                            disabled={true}>
                            <CheckIcon />
                        </button>
                        <button
                            class={'game-button decline-button'}
                            onClick={() => respondRematch(false)}>
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            );
            break;
        case rematchStates.ACCEPTED:
            rematchComponent = (
                <div id={'rematch'}>
                    <div id={'rematch-text'}>
                        Opponent proposed rematch
                        </div>
                    <div id={'rematch-buttons'}>
                        <button
                            class={'game-button accept-button'}
                            onClick={() => respondRematch(true)}>
                            <CheckIcon />
                        </button>
                        <button
                            class={'game-button decline-button'}
                            onClick={() => respondRematch(false)}>
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            );
            break;
        case rematchStates.REJECTED:
            rematchComponent = (
                <div id={'rematch'}>
                    <div id={'rematch-text'}>
                        Opponent declined rematch
                    </div>
                </div>
            );
            break;
        default:
            rematchComponent = null;
            break;
    }
    return (
        <Dialog open={checkmate} fullWidth={true} maxWidth={'xs'}>
            <DialogTitle id="dialog-title" className={'title'}>Game over</DialogTitle>
            <div className={'winner'}>
                {message}
            </div>
            {rematchComponent}
        </Dialog>
    );
}

export default React.memo(EndGame, (prevProps, nextProps) => {
    return prevProps.checkmate === nextProps.checkmate &&
        prevProps.gameResult === nextProps.gameResult &&
        prevProps.rematchState === nextProps.rematchState;
});