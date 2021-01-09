import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { GridList, GridListTile, Dialog, DialogTitle, Typography, Button, Container } from '@material-ui/core';
import { maxWidth, fontSize } from '@material-ui/system';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Col, Row } from 'react-bootstrap';
import Timers from '../components/Timers';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
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
import useSound from 'use-sound';
import moveSound from '../sounds/move1.mp3';
import HistoryIcon from '@material-ui/icons/History';
import FlagIcon from '@material-ui/icons/Flag';
import { Icon, InlineIcon } from '@iconify/react';
import handshakeIcon from '@iconify-icons/fa-solid/handshake';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import { PieceType, Color, drawStates } from '../enums';


export function Game(props) {
    const [sessionId, setSessionId] = useState(Cookies.get('sessionId'));
    const [gameId, setGameId] = useState(props.match.params.id);
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
  //  const [toMove, setToMove] = useState(false);
   // const [color, setColor] = useState(Color.SPECTATE);
    const colorRef = useRef();
    colorRef.current = gameState.color;
    const [selectedPiece, setSelectedPiece] = useState({
        validMoves: [],
        id: ""
    });
  //  const [awaitingPromotion, setAwaitingPromotion] = useState(null);
  //  const [checkmate, setCheckmate] = useState(false);
  //  const [winner, setWinner] = useState(null);
    const [drawState, setDrawState] = useState(drawStates.NEUTRAL);
    const [playMoveSound] = useSound(moveSound);
    const play = useRef();
    play.current = playMoveSound;
    /*
    useEffect(() => {
        if (sessionId == null) {
            fetch("/api/SampleData/guid")
                .then(res => res.text())
                .then((result) => {
                    setSessionId(result);
                    Cookies.set('sessionId', result, { sameSite: 'strict' });
                });
        }
    }, [sessionId]);

    useEffect(() => {
        var data = { userId: sessionId, gameId: gameId };
        fetch("api/Game/joingame", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(response => {
                setGameState(response.gamestate);
                setColor(response.color);
                if (response.gamestate.toMove == response.color)
                    setToMove(true);
                else
                    setToMove(false);
            });
    }, [gameId, sessionId]);

    useEffect(() => {
        if (toMove == false) {
            fetch("api/Game/game?userId=" + sessionId)
                .then(res => res.json())
                .then(response => {
                    setGameState(response);
                    setToMove(true);
                    setCheckmate(response.gameOver);
                });
        }
    }, [toMove]);

    */
    useEffect(() => {
        if (gameState.awaitingPromotion != null) {
            var file = gameState.awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
            var rank = gameState.awaitingPromotion[1] - 1;
            var board = gameState.gamestate.board;
            if (gameState.color == Color.WHITE) {
                board[file][rank] = {
                    type: PieceType.QUEEN,
                    color: Color.WHITE
                };
                board[file][rank - 1] = {
                    type: PieceType.ROOK,
                    color: Color.WHITE
                };
                board[file][rank - 2] = {
                    type: PieceType.KNIGHT,
                    color: Color.WHITE
                };
                board[file][rank - 3] = {
                    type: PieceType.BISHOP,
                    color: Color.WHITE
                };
            } else if (gameState.color == Color.BLACK) {
                board[file][rank] = {
                    type: PieceType.QUEEN,
                    color: Color.BLACK
                };
                board[file][rank + 1] = {
                    type: PieceType.ROOK,
                    color: Color.BLACK
                };
                board[file][rank + 2] = {
                    type: PieceType.KNIGHT,
                    color: Color.BLACK
                };
                board[file][rank + 3] = {
                    type: PieceType.BISHOP,
                    color: Color.BLACK
                };
            }
            updateState({
                gamestate: {
                    board: board,
                    toMove: gameState.gamestate.toMove,
                    turnCount: gameState.gamestate.turnCount,
                    whiteTime: gameState.gamestate.whiteTime,
                    blackTime: gameState.gamestate.blackTime
                }
            });
        }
    }, [gameState.awaitingPromotion]);

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

    useEffect(() => {
        props.hubConnection.off('opponentReady');
        props.hubConnection.on('updateGameState', gamestateJson => {
          
            let gamestate = JSON.parse(gamestateJson);
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
            play.current();
           
        });
        props.hubConnection.on('timerElapsed', winner => {
            updateState({
                toMove: false,
                winner: winner,
                checkmate: true
            });
        });
        props.hubConnection.on('awaitingPromotion', position => {
            updateState({
                awaitingPromotion: position
            });
        });
        props.hubConnection.on('drawAccepted', () => {
            updateState({
                winner: 2,
                checkmate: true,
                toMove: false
            });
            setDrawState(drawStates.NEUTRAL);
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
        let id = gameId;
        props.hubConnection.invoke('JoinGame', parseInt(id))
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

    }, [gameId]);

    const Board = () => {
        if (gameState != 0)
            return (
                <div style={{ maxWidth: "480px" }}>
                    <GridList cellHeight={60} cols={8} spacing={0}>
                        {gameState.gamestate.board.map((row, i1) => row.map((tile, i2) => (
                            <Square i1={i1} i2={i2} tile={tile} />
                        )))}
                    </GridList>
                </div>
            );
        else return null;
    }
    var squares = [];
    const Board2 = () => {
        if (gameState.gamestate.turnCount != 0) {
            squares = Squares();
            return (
                <div className={'board'}>
                    {squares.map((row, i) => row.map((tile, j) => (
                        <div key={i * 10 + j}>
                                {tile}
                            </div>
                        )))}
                </div>
            );
        }

        else return null;
    }


    var draggedPiece;
    var highlightedSquares = [];
    var x_pos = 0, y_pos = 0, cursor_x = 0, cursor_y = 0;
    var selected = null;

    document.ondragover = (e) => {
        
        cursor_x = e.clientX;
        cursor_y = e.clientY;
        if (selected != null) {
            var x_offset = cursor_x - x_pos;
            var y_offset = cursor_y - y_pos;
            selected.style.transform = "translate(calc(" + x_offset + "px - 5vh), calc(" + y_offset + "px - 5vh))";
        }
        e.preventDefault();
    }

    const drag = (e) => {
        e.preventDefault();
        
        
    }

    const dragStartPiece = (e, f, r) => {

        clearHighlight();
        highlightValidMoves(f, r);
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        e.dataTransfer.setDragImage(img, 0, 0);
        if (highlightedSquares.length > 0) {
            
            draggedPiece = { piece: gameState.gamestate.board[f][r], id: e.currentTarget.id };
            selected = e.target.lastChild;
            x_pos = selected.x;
            y_pos = selected.y;
        }
        
    }

    const dropPiece = (e) => {
        e.preventDefault();
        if (draggedPiece != undefined && draggedPiece.piece.color == gameState.color && gameState.toMove == true) {
            let file = Number.parseInt(e.currentTarget.getAttribute('f'));
            let rank = Number.parseInt(e.currentTarget.getAttribute('r'));

            if (draggedPiece.piece.validMoves.find(m => m.file == file && m.rank == rank) != undefined) {

                var pieceImg = document.getElementById(draggedPiece.id).lastChild;
                var oldParent = document.getElementById(e.currentTarget.id);
                if (oldParent.hasChildNodes() && oldParent.lastChild.nodeName == "IMG")
                    oldParent.removeChild(oldParent.lastChild);
                document.getElementById(draggedPiece.id).removeChild(pieceImg);
                pieceImg.style.transform = "";
                oldParent.appendChild(pieceImg);
                move(draggedPiece.id, e.currentTarget.id);
            }
        }
    }

    const Tile = (props) => {
        var square = gameState.gamestate.board[props.f][props.r];
        var tile;
        var file = String.fromCharCode('A'.charCodeAt() + props.f);
        var rank = props.r + 1;
        var label = null;
        if (gameState.color == Color.WHITE || gameState.color == Color.SPECTATE) {
            if (props.f == 7 && props.r == 0)
                label = (
                    <div class={'square-label-double'}>
                        <div class={'square-label-file'}>
                            {file.toLowerCase()}
                        </div>
                        <div class={'square-label-rank'}>
                            {rank}
                        </div>
                    </div>
                );
            else if (props.f == 7) {
                label = (
                    <div class={'square-label-rank'}>
                        {rank}
                    </div>
                );
            }
            else if (props.r == 0) {
                label = (
                    <div class={'square-label-file'}>
                        {file.toLowerCase()}
                    </div>
                );
            }
        } else {
            if (props.f == 0 && props.r == 7)
                label = (
                    <div class={'square-label-double'}>
                        <div class={'square-label-file'}>
                            {file.toLowerCase()}
                        </div>
                        <div class={'square-label-rank'}>
                            {rank}
                        </div>
                    </div>
                );
            else if (props.f == 0) {
                label = (
                    <div class={'square-label-rank'}>
                        {rank}
                    </div>
                );
            }
            else if (props.r == 7) {
                label = (
                    <div class={'square-label-file'}>
                        {file.toLowerCase()}
                    </div>
                );
            }
        }

        if (square != null) {
            tile = (
       
                    <div
                        draggable
          
                        onDragStart={(e) => dragStartPiece(e, props.f, props.r)}
                        onDragEnd={(e) => dragend(e)}
                        onDragEnter={e => dragenter(e)}
                        onDragLeave={e => dragleave(e)}
                        onDrop={e => dropPiece(e)}
                        onClick={(e) => onSquareClick(props.f, props.r, e)}
                        onMouseEnter={e => dragenter(e)}
                        onMouseLeave={e => dragleave(e)}
                        id={file + rank}
                        className={props.class}
                        f={props.f}
                        r={props.r}
                    >
                        {label}
                        <PieceImage color={square.color} type={square.type} />
                    </div>
             
            );
        } else {
            tile = (
                <div
                    onClick={(e) => onSquareClick(props.f, props.r, e)}
                    onDrop={e => dropPiece(e)} id={file + rank}
                    onDragEnter={e => dragenter(e)}
                    onDragLeave={e => dragleave(e)}
                    onMouseEnter={e => dragenter(e)}
                    onMouseLeave={e => dragleave(e)}
                    className={props.class} f={props.f} r={props.r}
                >
                        {label}
                </div>
            );
        }

        return tile;
    }

    const dragenter = (e) => {
        //console.log(e);
        //e.preventDefault();
        let id = e.currentTarget.getAttribute('id');
        if (highlightedSquares.find(s => s.id == id) != undefined)
            e.currentTarget.classList.add('dragged-over');
    }

    const dragleave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragged-over');
    }

    const dragend = (e) => {
        if (gameState.toMove) {
            clearHighlight();
            draggedPiece = undefined;
            if (selected != null) {
                selected.style.transform = "";
                selected = null;
            }
        } 
    }


    const PromotionTile = (props) => {
        return (
            <div
                className={'highlighted-square'}
                onClick={() => promote(props.type)}
            >
                <PieceImage color={props.color} type={props.type} />
            </div>
        );
    }


    var Squares = () => {
        //var squares = [];
        if (gameState.color == Color.WHITE || gameState.color == Color.SPECTATE) {
            for (var j = 0; j < 8; j++) {
                squares[j] = [];
            }
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if ((i + j) % 2 == 0)
                        squares[7 - i][j] = (<Tile f={j} r={i} class={'white-square'} />);
                    else
                        squares[7 - i][j] = (<Tile f={j} r={i} class={'black-square'} />);
                }
            }
            if (gameState.gamestate.lastMove != null && gameState.gamestate.lastMove.item1 != null) {
                let from = gameState.gamestate.lastMove.item1;
                let to = gameState.gamestate.lastMove.item2;
             
                
                squares[7 - from.rank][from.file] = (<Tile f={from.file} r={from.rank}
                    class={squares[7 - from.rank][from.file].props.class + " moved"} />);
                squares[7 - to.rank][to.file] = (<Tile f={to.file} r={to.rank}
                    class={squares[7 - to.rank][to.file].props.class + " moved"} />);
                
               
            }
            if (gameState.awaitingPromotion != null) {
                var file = gameState.awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
                var rank = gameState.awaitingPromotion[1] - 1;
                if (gameState.color == Color.WHITE) {
                    squares[7 - rank][file] = (<PromotionTile color={Color.WHITE} type={PieceType.QUEEN} />);
                    squares[7 - rank + 1][file] = (<PromotionTile color={Color.WHITE} type={PieceType.ROOK} />);
                    squares[7 - rank + 2][file] = (<PromotionTile color={Color.WHITE} type={PieceType.KNIGHT} />);
                    squares[7 - rank + 3][file] = (<PromotionTile color={Color.WHITE} type={PieceType.BISHOP} />);
                } else if (gameState.color == Color.BLACK) {
                    squares[7 - rank][file] = (<PromotionTile color={Color.BLACK} type={PieceType.QUEEN} />);
                    squares[7 - rank - 1][file] = (<PromotionTile color={Color.BLACK} type={PieceType.ROOK} />);
                    squares[7 - rank - 2][file] = (<PromotionTile color={Color.BLACK} type={PieceType.KNIGHT} />);
                    squares[7 - rank - 3][file] = (<PromotionTile color={Color.BLACK} type={PieceType.BISHOP} />);
                }
            }
            return squares;
        } else {
            for (var j = 0; j < 8; j++) {
                squares[j] = [];
            }
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if ((i + j) % 2 == 0)
                        squares[i][7 - j] = (<Tile f={j} r={i} class={'white-square'} />);
                    else
                        squares[i][7 - j] = (<Tile f={j} r={i} class={'black-square'} />);
                }
            }
            if (gameState.gamestate.lastMove != null && gameState.gamestate.lastMove.item1 != null) {
                let from = gameState.gamestate.lastMove.item1;
                let to = gameState.gamestate.lastMove.item2;
                squares[from.rank][7 - from.file] = (<Tile f={from.file} r={from.rank}
                    class={squares[from.rank][7-from.file].props.class + " moved"} />);
                squares[to.rank][7 - to.file] = (<Tile f={to.file} r={to.rank}
                    class={squares[to.rank][7 - to.file].props.class + ' moved'} />);
            }
            if (gameState.awaitingPromotion != null) {
                var file = gameState.awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
                var rank = gameState.awaitingPromotion[1] - 1;
                if (gameState.color == Color.WHITE) {
                    squares[rank][file] = (<PromotionTile color={Color.WHITE} type={PieceType.QUEEN} />);
                    squares[rank + 1][file] = (<PromotionTile color={Color.WHITE} type={PieceType.ROOK} />);
                    squares[rank + 2][file] = (<PromotionTile color={Color.WHITE} type={PieceType.KNIGHT} />);
                    squares[rank + 3][file] = (<PromotionTile color={Color.WHITE} type={PieceType.BISHOP} />);
                } else if (gameState.color == Color.BLACK) {
                    squares[rank][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.QUEEN} />);
                    squares[rank + 1][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.ROOK} />);
                    squares[rank + 2][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.KNIGHT} />);
                    squares[rank + 3][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.BISHOP} />);
                }
            }
            return squares;
        }

    }

    const Square = (props) => {

        if ((props.i1 + props.i2) % 2 == 0)
            return (
                <GridListTile cols={1} className={'white-square'} f={props.i1} r={props.i2}>
                    {props.tile != null &&
                        <div draggable={'true'} onDragStart={(e) => console.log(e)} onClick={(e) => {
                            onSquareClick(props.tile);
                        }}>
                            <PieceImage color={props.tile.color} type={props.tile.type} />
                        </div>
                    }
                </GridListTile>
            );
        else return (
            <GridListTile cols={1} className={'black-square'} f={props.i1} r={props.i2}>
                {props.tile != null &&
                    <PieceImage color={props.tile.color} type={props.tile.type} />}
            </GridListTile>
        );
    };



    const onSquareClick = (f, r, e) => {
        console.log(e.target);
        if (gameState.toMove == true) {
            if (draggedPiece == undefined) {
                if (gameState.gamestate.board[f][r] != null &&
                    gameState.gamestate.board[f][r].color == gameState.color &&
                    gameState.gamestate.board[f][r].validMoves != null) {
                    clearHighlight();
                    draggedPiece = { piece: gameState.gamestate.board[f][r], id: e.currentTarget.id };
                    highlightValidMoves(f, r);
                }
            }
            else
            {
                if (draggedPiece.piece.validMoves.find((move) => move.file == f && move.rank == r) != undefined) {
                    clearHighlight();
                    var pieceImg = document.getElementById(draggedPiece.id).lastChild;
                    var oldParent = document.getElementById(e.currentTarget.id);
                    if (oldParent.hasChildNodes() && oldParent.lastChild.nodeName == "IMG")
                        oldParent.removeChild(oldParent.lastChild);
                    document.getElementById(draggedPiece.id).removeChild(pieceImg);
                    oldParent.appendChild(pieceImg);
                    move(draggedPiece.id, e.currentTarget.id);
                }
                else if (gameState.gamestate.board[f][r] != null &&
                    gameState.gamestate.board[f][r].color == gameState.color &&
                    gameState.gamestate.board[f][r].validMoves != null) {
                    clearHighlight();
                    draggedPiece = { piece: gameState.gamestate.board[f][r], id: e.currentTarget.id };
                    highlightValidMoves(f, r);
                } else {
                    draggedPiece = undefined;
                    clearHighlight();
                } 

            }
        }
        
    }

    const highlightValidMoves = (f, r) => {
        if (gameState.toMove == true && gameState.gamestate.board[f][r].color == gameState.color) {
            var validMoves = gameState.gamestate.board[f][r].validMoves;
            let highlight = document.createElement("span");
            highlight.className = 'dot';
            validMoves.forEach(move => {
                var file = String.fromCharCode(move.file + 'A'.charCodeAt());
                var rank = move.rank + 1;
                highlightedSquares.push({
                    id: file + rank,
                    class: document.getElementById(file + rank).className
                });
                //document.getElementById(file + rank).className = 'highlighted-square';
                let highlight = document.createElement("span");
                highlight.className = 'dot';
                document.getElementById(file + rank).prepend(highlight);
            });
        }
    };

    const clearHighlight = () => {
        highlightedSquares.forEach(h => {
            document.getElementById(h.id).removeChild(document.getElementById(h.id).firstChild);
        });
        highlightedSquares = [];
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

    const resign = () => {
        props.hubConnection.invoke('Resign');
    }

    const PieceImage = (tile) => {

        var path = "../images/" + tile.color + "_" + tile.type + ".png";
        if (tile.color == Color.WHITE) {
            switch (tile.type) {
                case PieceType.PAWN:
                    return (<img src={WHITE_PAWN} height="100%" width="100%" />);
                case PieceType.KNIGHT:
                    return (<img src={WHITE_KNIGHT} height="100%" width="100%" />);
                case PieceType.BISHOP:
                    return (<img src={WHITE_BISHOP} height="100%" width="100%" />);
                case PieceType.ROOK:
                    return (<img src={WHITE_ROOK} height="100%" width="100%" />);
                case PieceType.QUEEN:
                    return (<img src={WHITE_QUEEN} height="100%" width="100%" />);
                case PieceType.KING:
                    return (<img src={WHITE_KING} height="100%" width="100%" />);
            }
        } else {
            switch (tile.type) {
                case PieceType.PAWN:
                    return (<img src={BLACK_PAWN} height="100%" width="100%" />);
                case PieceType.KNIGHT:
                    return (<img src={BLACK_KNIGHT} height="100%" width="100%" />);
                case PieceType.BISHOP:
                    return (<img src={BLACK_BISHOP} height="100%" width="100%" />);
                case PieceType.ROOK:
                    return (<img src={BLACK_ROOK} height="100%" width="100%" />);
                case PieceType.QUEEN:
                    return (<img src={BLACK_QUEEN} height="100%" width="100%" />);
                case PieceType.KING:
                    return (<img src={BLACK_KING} height="100%" width="100%" />);
            }
        }
    }

    const useStyles = makeStyles((theme) => ({
        button: {
            margin: "14px",
            marginTop: "20px"
        }
    }));

    const styles = (theme) => ({
        title: {
            fontSize: "32px",
            alignSelf: "center"
        }
    });

    const classes = useStyles();

    const DialogTitle = withStyles(styles)((props) => {
        const { children, classes } = props;
        return (
            <MuiDialogTitle disableTypography className={classes.title}>
                {children}
            </MuiDialogTitle>
        );
    });

    const EndGame = (props) => {
        let message;
        switch (gameState.gamestate.gameResult) {
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
        }
        return (
            <Dialog open={gameState.checkmate} fullWidth={true} maxWidth={'xs'}>
                <DialogTitle id="dialog-title">Game over</DialogTitle>
                <div class="winner">
                    {message}
                </div>
                <Button variant="contained" size="large" color="primary" className={classes.button} onClick={() => Rematch()}>Play again</Button>
            </Dialog>
        );
    }

    const Rematch = () => {
        window.location.reload(false);
    };

    const Draw = () => {
        var component;
        switch (drawState) {
            case drawStates.NEUTRAL:
                component = (
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
                break;
            case drawStates.PROPOSED:
                component = (
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
                break;
            case drawStates.REJECTED:
                component = (
                    <div id={'draw'}>
                        <button
                            className={'game-button draw-button pending'}
                            disabled={'true'}>
                            <Icon icon={handshakeIcon} />
                        </button>
                    </div>
                );
                break;
            case drawStates.WAITING:
                component = (
                    <div id={'draw'}>
                        <button
                            className={'game-button draw-button pending'}
                            disabled={'true'}>
                            <Icon icon={handshakeIcon} />
                        </button>
                    </div>
                );
                break;
        }
        return component;
    }

    const Buttons = () => {
        return (
            <div id={'buttons'}>
                <Draw />
                <button
                    className={'game-button resign-button'}
                    onClick={() => resign()}>
                    <FlagIcon />
                    <div className={'tooltip-text'}>
                        Resign
                    </div>
                </button>
                <Takeback />
            </div>
        );
    }

    const Takeback = () => {
        var component;
        switch (gameState.takebackState) {
            case drawStates.NEUTRAL:
                component = (
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
                break;
            case drawStates.PROPOSED:
                component = (
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
                break;
            case drawStates.WAITING:
                component = (
                    <div id={'takeback'}>
                        <button
                            className={'game-button takeback-button pending'}
                            disabled={true}>
                            <HistoryIcon />
                        </button>
                    </div>
                );
                break;
            default:
                component = null;
                break;
        }
        return component;
    }

    return (
        <div className={'board-container'}>
            <Buttons />
            <Board2 />
            <Timers
                whiteTime={gameState.gamestate.whiteTime}
                blackTime={gameState.gamestate.blackTime}
                toMove={gameState.gamestate.toMove}
                turnCount={gameState.gamestate.turnCount}
                color={gameState.color}
            />
            <EndGame />
        </div>
    );
}