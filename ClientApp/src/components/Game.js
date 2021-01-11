import React, { useState, useEffect, useRef } from 'react';
import Board from './Board/Board';
import Timers from './Board/Timers';
import EndGame from './EndGame';
import Buttons from './Buttons';
import useSound from 'use-sound';
import moveSound from '../sounds/move1.mp3';


import { Color, drawStates, rematchStates } from '../enums';



export function Game(props) {
    const [gameId] = useState(props.match.params.id);
    const [gameState, setGameState] = useState({
        gamestate: {
            board: [],
            toMove: [],
            turnCount: 0,
            whiteTime: 0,
            blackTime: 0,
            gameResult: "ACTIVE",
            lastMove: null,
            takebackState: drawStates.NEUTRAL
        },
        toMove: false,
        awaitingPromotion: null,
        checkmate: false,
        winner: null,
        color: Color.SPECTATE
    });
    const gameStateRef = useRef();
    gameStateRef.current = gameState;
    const updateState = newState => setGameState(Object.assign({}, gameStateRef.current, newState));
    const colorRef = useRef();
    colorRef.current = gameState.color;
    const [rematchState, setRematchState] = useState(rematchStates.NEUTRAL);
    const [drawState, setDrawState] = useState(drawStates.NEUTRAL);
    const [playMoveSound] = useSound(moveSound);

    useEffect(() => {
        props.hubConnection.on('updateGameState', gamestate => {
            let toMove;
            let takeback;
            if (gamestate.toMove == colorRef.current) {
                toMove = true;
                takeback = drawStates.WAITING;
            }
            else {
                toMove = false;
                takeback = drawStates.NEUTRAL;
            }
            updateState({
                gamestate: gamestate,
                toMove: toMove,
                awaitingPromotion: null,
                checkmate: gamestate.gameOver,
                takebackState: takeback
            });
        });
        props.hubConnection.on('awaitingPromotion', position => {
            updateState({
                awaitingPromotion: position
            });
        });
        props.hubConnection.on('drawRejected', () => {
            setDrawState(drawStates.REJECTED);
            const changeState = () => setDrawState(drawStates.NEUTRAL);
            setTimeout(() => {
                changeState();
                clearTimeout(changeState);
            }, 4000);

        });
        props.hubConnection.on('drawProposed', () => {
            setDrawState(drawStates.PROPOSED);
        });
        props.hubConnection.on('takebackRequested', () => {
            updateState({ takebackState: drawStates.PROPOSED });
        });
        props.hubConnection.on('takebackRejected', () => {
            updateState({ takebackState: drawStates.WAITING });
        });
        props.hubConnection.on('rematchAccepted', () => {
            setRematchState(rematchStates.ACCEPTED);
        });
        props.hubConnection.on('rematchDeclined', () => {
            setRematchState(rematchStates.REJECTED);
        });
        props.hubConnection.on('rematch', () => {
            setRematchState(rematchStates.NEUTRAL);
            joinGame();
        });
        joinGame();
    }, []);

    useEffect(() => {
        playMoveSound();
    }, [gameState.gamestate]);

    const move = (src, dst) => {
        if (gameState.toMove == true) {
            props.hubConnection.invoke('Move', src, dst);
        }
    };

    const proposeTakeback = () => {
        props.hubConnection.invoke('RequestTakeback');
        updateState({ takebackState: drawStates.WAITING });
    };

    const respondTakeback = (response) => {
        props.hubConnection.invoke('RespondTakeback', response)
    }

    const joinGame = () => {
        props.hubConnection.invoke('JoinGame', parseInt(gameId))
            .then(color => {
                if (color == "WHITE")
                    updateState({
                        color: Color.WHITE
                    });
                else if (color == "BLACK")
                    updateState({
                        color: Color.BLACK
                    });
                else
                    updateState({
                        color: Color.SPECTATE
                    });
                props.hubConnection.invoke("Update");
            });
    }

    const promote = (type) => {
        props.hubConnection.invoke('Promote', type);
    };

    const proposeDraw = () => {
        props.hubConnection.invoke('ProposeDraw');
        setDrawState(drawStates.WAITING);
    };

    const respondDraw = (response) => {
        props.hubConnection.invoke('RespondDraw', response);
    };

    const respondRematch = (response) => {
        props.hubConnection.invoke('RespondRematch', response);
        if (response == true) {
            setRematchState(rematchStates.AWAITING);
        } else {
            updateState({ checkmate: false });
        }
    }

    const resign = () => {
        props.hubConnection.invoke('Resign');
    }

    

    return (
        <div className={'board-container'}>
            <Buttons
                proposeDraw={proposeDraw}
                respondDraw={respondDraw}
                proposeTakeback={proposeTakeback}
                respondTakeback={respondTakeback}
                takebackState={gameState.takebackState}
                drawState={drawState}
                resign={resign}
            />
            <Board
                gamestate={gameState.gamestate}
                awaitingPromotion={gameState.awaitingPromotion}
                color={gameState.color}
                move={move}
                promote={promote}
            />
            <Timers
                whiteTime={gameState.gamestate.whiteTime}
                blackTime={gameState.gamestate.blackTime}
                toMove={gameState.gamestate.toMove}
                turnCount={gameState.gamestate.turnCount}
                color={gameState.color}
            />
            <EndGame
                gameResult={gameState.gamestate.gameResult}
                rematchState={rematchState}
                checkmate={gameState.checkmate}
                respondRematch={respondRematch}
            />
        </div>
    );
}