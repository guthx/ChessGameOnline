import React, { useState, useEffect, useRef } from 'react';
import Board from './Board/Board';
import RightMenu from './RightMenu';
import EndGame from './EndGame';
import Buttons from './Buttons';
import useSound from 'use-sound';
import moveSound from '../sounds/move1.mp3';
import Gamestate from '../GameLogic/Gamestate';
import WHITE_QUEEN from '../images/cburnett/wQ.svg';
import WHITE_ROOK from '../images/cburnett/wR.svg';
import WHITE_BISHOP from '../images/cburnett/wB.svg';
import WHITE_KNIGHT from '../images/cburnett/wN.svg';
import WHITE_PAWN from '../images/cburnett/wP.svg';
import WHITE_KING from '../images/cburnett/wK.svg';
import BLACK_QUEEN from '../images/cburnett/bQ.svg';
import BLACK_ROOK from '../images/cburnett/bR.svg';
import BLACK_BISHOP from '../images/cburnett/bB.svg';
import BLACK_KNIGHT from '../images/cburnett/bN.svg';
import BLACK_PAWN from '../images/cburnett/bP.svg';
import BLACK_KING from '../images/cburnett/bK.svg';
import MiniPawn from '../images/cburnett/miniP.svg';
import MiniKnight from '../images/cburnett/miniN.svg';
import MiniBishop from '../images/cburnett/miniB.svg';
import MiniRook from '../images/cburnett/miniR.svg';
import MiniQueen from '../images/cburnett/miniQ.svg';
import Spinner from '../images/spinner.gif';
import { Color, drawStates, rematchStates } from '../enums';



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
    const [premove, setPremove] = useState(null);
    const positionHistoryRef = useRef();
    positionHistoryRef.current = positionHistory;
    const [playMoveSound] = useSound(moveSound);
    const [picturesLoaded, setPicturesLoaded] = useState(0);
    const picsLoadedRef = useRef();
    picsLoadedRef.current = picturesLoaded;
    const pictures = [WHITE_BISHOP, WHITE_KING, WHITE_KNIGHT, WHITE_PAWN, WHITE_QUEEN, WHITE_ROOK,
        BLACK_BISHOP, BLACK_KING, BLACK_KNIGHT, BLACK_PAWN, BLACK_QUEEN, BLACK_ROOK,
        MiniBishop, MiniKnight, MiniPawn, MiniQueen, MiniRook];
    
    useEffect(() => {
        pictures.forEach(picture => {
            const img = new Image();
            img.src = picture;
            img.onload = () => {
                console.log(picturesLoaded);
                setPicturesLoaded(picsLoadedRef.current + 1);
            }
        });
    }, []);
    
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
        executePremove();
    }, [gamestate]);

    const move = (src, dst) => {
        props.hubConnection.invoke('Move', src, dst);
    };

    const executePremove = () => {
        if (premove != null) {
            if (gamestate.board[premove.src.file][premove.src.rank].color == color &&
                gamestate.board[premove.src.file][premove.src.rank].validMoves(gamestate).find(m => m.file == premove.dst.file && m.rank == premove.dst.rank) != undefined) {
                let src = String.fromCharCode(premove.src.file + 65) + (premove.src.rank + 1);
                let dst = String.fromCharCode(premove.dst.file + 65) + (premove.dst.rank + 1);
                setPremove(null);
                move(src, dst);
            }
            else {
                setPremove(null);
            }
        }
    }

    const proposeTakeback = () => {
        props.hubConnection.invoke('RequestTakeback');
        setPremove(null);
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
    if (picturesLoaded == pictures.length)
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
                    setPremove={setPremove}
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
    else return (
        <div className={'loading'}>
            <img src={Spinner} />
        </div>
        );

}