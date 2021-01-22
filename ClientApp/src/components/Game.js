import React, { useState, useEffect, useRef } from 'react';
import Board from './Board/Board';
import RightMenu from './RightMenu';
import EndGame from './EndGame';
import Buttons from './Buttons';
import useSound from 'use-sound';
import moveSound from '../sounds/move1.mp3';
import Gamestate from '../GameLogic/Gamestate';

import { Color, drawStates, rematchStates } from '../enums';
import MoveHistory from './MoveHistory';
import PieceDifference from './Board/PieceDifference';



export function Game(props) {
    const [gameId] = useState(props.match.params.id);
    const [gamestate, setGamestate] = useState(new Gamestate("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
    const [tempGamestate, setTempGamestate] = useState(null);
    const [awaitingPromotion, setAwaitingPromotion] = useState(null);
    const [lastMove, setLastMove] = useState(null);
    const [gameResult, setGameResult] = useState("ACTIVE");
    const [toMove, setToMove] = useState(false);
    const toMoveRef = useRef();
    toMoveRef.current = toMove;
    const [gameOver, setGameOver] = useState(false);
    const [color, setColor] = useState(Color.SPECTATE);
    const [takebackState, setTakebackState] = useState(drawStates.NEUTRAL);
    const [timers, setTimers] = useState({ whiteTime: 0, blackTime: 0 });
    const colorRef = useRef();
    colorRef.current = color;
    const [rematchState, setRematchState] = useState(rematchStates.NEUTRAL);
    const [drawState, setDrawState] = useState(drawStates.NEUTRAL);
    const [moveHistory, setMoveHistory] = useState([]);
    const moveHistoryRef = useRef();
    moveHistoryRef.current = moveHistory;
    const [positionHistory, setPositionHistory] = useState([]);
    const positionHistoryRef = useRef();
    positionHistoryRef.current = positionHistory;
    const [playMoveSound] = useSound(moveSound);


    useEffect(() => {
        props.hubConnection.on('updateGameState', response => {
            var newGamestate = new Gamestate(response.fen);
            setLastMove(response.lastMove);
            setGamestate(newGamestate);
            if (response.gameResult != undefined) {
                setGameResult(response.gameResult);
                setGameOver(true);
            }
            setTimers({
                whiteTime: response.whiteTime,
                blackTime: response.blackTime
            });
            setAwaitingPromotion(null);
            if (colorRef.current == newGamestate.toMove) {
                setToMove(true);
                setTakebackState(drawStates.WAITING);
            }
            else {
                setToMove(false);
                setTakebackState(drawStates.NEUTRAL);
            }       
            setMoveHistory([
                ...moveHistoryRef.current,
                response.moveNotation
            ]);
            setPositionHistory([
                ...positionHistoryRef.current,
                response.fen
            ]);
            document.getElementById('move-history').scrollTop = document.getElementById('move-history').scrollHeight;
            setTempGamestate(null);
            
        });
        props.hubConnection.on('setGameState', response => {
            var newGamestate = new Gamestate(response.fen);
            setLastMove(response.lastMove);
            setGamestate(newGamestate);
            if (response.gameResult != undefined) {
                setGameResult(response.gameResult);
            }
            setTimers({
                whiteTime: response.whiteTime,
                blackTime: response.blackTime
            });
            setAwaitingPromotion(null);
            if (response.gameResult != undefined) {
                setGameResult(response.gameResult);
                setGameOver(true);
            }
            if (colorRef.current == newGamestate.toMove) {
                setToMove(true);
                setTakebackState(drawStates.WAITING);
            }
            else {
                setToMove(false);
                setTakebackState(drawStates.NEUTRAL);
            }    
            setMoveHistory(response.moveHistory);
            setPositionHistory(response.positionHistory);
        });
        props.hubConnection.on('awaitingPromotion', position => {
            setAwaitingPromotion(position);
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
            setTakebackState(drawStates.PROPOSED);
        });
        props.hubConnection.on('takebackRejected', () => {
            setTakebackState(drawStates.WAITING);
        });
        props.hubConnection.on('rematchAccepted', () => {
            setRematchState(rematchStates.ACCEPTED);
        });
        props.hubConnection.on('rematchDeclined', () => {
            setRematchState(rematchStates.REJECTED);
        });
        props.hubConnection.on('rematch', () => {
            setRematchState(rematchStates.NEUTRAL);
            setDrawState(drawStates.NEUTRAL);
            setTakebackState(drawStates.NEUTRAL);
            setGameOver(false);
            joinGame();
        });
        joinGame();
    }, []);

    useEffect(() => {
        playMoveSound();
    }, [gamestate]);

    const move = (src, dst) => {
        if (toMoveRef.current == true) {
            props.hubConnection.invoke('Move', src, dst);
        }
    };

    const proposeTakeback = () => {
        props.hubConnection.invoke('RequestTakeback');
        setTakebackState(drawStates.WAITING);
    };

    const respondTakeback = (response) => {
        props.hubConnection.invoke('RespondTakeback', response)
    }

    const joinGame = () => {
        props.hubConnection.invoke('JoinGame', parseInt(gameId))
            .then(color => {
                if (color == "WHITE")
                    setColor(Color.WHITE);
                else if (color == "BLACK")
                    setColor(Color.BLACK);
                else
                    setColor(Color.SPECTATE);
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
            setGameOver(false);
        }
    }

    const resign = () => {
        props.hubConnection.invoke('Resign');
    }

    const viewPreviousState = (positionNumber) => {
        console.log(positionNumber);
        if (positionNumber >= positionHistory.length - 1)
            setTempGamestate(null);
        else
            setTempGamestate(new Gamestate(positionHistory[positionNumber]));
    }

    return (
        <div className={'game-container'}>
            <Buttons
                proposeDraw={proposeDraw}
                respondDraw={respondDraw}
                proposeTakeback={proposeTakeback}
                respondTakeback={respondTakeback}
                takebackState={takebackState}
                drawState={drawState}
                resign={resign}
            />
            <Board
                gamestate={gamestate}
                tempGamestate={tempGamestate}
                awaitingPromotion={awaitingPromotion}
                color={color}
                move={move}
                promote={promote}
                lastMove={lastMove}
            />
            <RightMenu
                whiteTime={timers.whiteTime}
                blackTime={timers.blackTime}
                toMove={gamestate.toMove}
                color={color}
                moveHistory={moveHistory}
                viewState={viewPreviousState}
            />
            <EndGame
                gameResult={gameResult}
                rematchState={rematchState}
                checkmate={gameOver}
                respondRematch={respondRematch}
            />
        </div>
    );
}