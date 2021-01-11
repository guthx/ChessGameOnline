import React from 'react';
import HistoryIcon from '@material-ui/icons/History';
import FlagIcon from '@material-ui/icons/Flag';
import { Icon } from '@iconify/react';
import handshakeIcon from '@iconify-icons/fa-solid/handshake';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { drawStates } from '../enums';

function Buttons ({
    proposeDraw,
    respondDraw,
    proposeTakeback,
    respondTakeback,
    takebackState,
    drawState,
    resign
}){
    return (
        <div id={'buttons'}>
            <Draw
                proposeDraw={proposeDraw}
                respondDraw={respondDraw}
                drawState={drawState}
            />
            <button
                className={'game-button resign-button'}
                onClick={() => resign()}>
                <FlagIcon />
                <div className={'tooltip-text'}>
                    Resign
                    </div>
            </button>
            <Takeback
                proposeTakeback={proposeTakeback}
                respondTakeback={respondTakeback}
                takebackState={takebackState}
            />
        </div>
    );
}

function Takeback({
    proposeTakeback,
    respondTakeback,
    takebackState
}) {
    switch (takebackState) {
        case drawStates.NEUTRAL:
            return (
                <div id={'takeback'}>
                    <button
                        className={'game-button takeback-button'}
                        onClick={() => proposeTakeback()}>
                        <HistoryIcon />
                        <div className={'tooltip-text'}>
                            Request takeback
                            </div>
                    </button>
                </div>
            );
        case drawStates.PROPOSED:
            return (
                <div id={'takeback'}>
                    <button
                        className={'game-button takeback-button'}
                        disabled={true}>
                        Takeback?
                        </button>
                    <div id={'draw-response'}>
                        <button
                            className={'game-button accept-button'}
                            onClick={() => respondTakeback(true)}>
                            <CheckIcon />
                        </button>
                        <button
                            className={'game-button decline-button'}
                            onClick={() => respondTakeback(false)}>
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            );
        case drawStates.WAITING:
            return (
                <div id={'takeback'}>
                    <button
                        className={'game-button takeback-button pending'}
                        disabled={true}>
                        <HistoryIcon />
                    </button>
                </div>
            );
        default:
            return null;
    }
}

function Draw({
    proposeDraw,
    respondDraw,
    drawState
}){
    switch (drawState) {
        case drawStates.NEUTRAL:
            return (
                <div id={'draw'}>
                    <button
                        className={'game-button draw-button'}
                        onClick={() => proposeDraw()}>
                        <Icon icon={handshakeIcon} />
                        <div className={'tooltip-text'}>
                            Propose draw
                            </div>
                    </button>
                </div>
            );
        case drawStates.PROPOSED:
            return (
                <div id={'draw'}>
                    <button
                        className={'game-button draw-button'} >
                        Draw?
                        </button>
                    <div id={'draw-response'}>
                        <button
                            className={'game-button accept-button'}
                            onClick={() => respondDraw(true)}>
                            <CheckIcon />
                        </button>
                        <button
                            className={'game-button decline-button'}
                            onClick={() => respondDraw(false)}>
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            );
        case drawStates.REJECTED:
            return (
                <div id={'draw'}>
                    <button
                        className={'game-button draw-button pending'}
                        disabled={'true'}>
                        <Icon icon={handshakeIcon} />
                    </button>
                </div>
            );
        case drawStates.WAITING:
            return (
                <div id={'draw'}>
                    <button
                        className={'game-button draw-button pending'}
                        disabled={'true'}>
                        <Icon icon={handshakeIcon} />
                    </button>
                </div>
            );
    }
}

export default React.memo(Buttons, (prevProps, nextProps) => {
    return prevProps.drawState == nextProps.drawState &&
        prevProps.takebackState == nextProps.takebackState;
});