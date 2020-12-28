import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { GridList, GridListTile, Dialog, DialogTitle, Typography, Button } from '@material-ui/core';
import { maxWidth, fontSize } from '@material-ui/system';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';


export function Game(props) {
    const [sessionId, setSessionId] = useState(Cookies.get('sessionId'));
    const [gameId, setGameId] = useState(props.match.params.id);
    const [gameState, setGameState] = useState({
        board: [],
        toMove: [],
        turnCount: 0
    });
    const [toMove, setToMove] = useState(true);
    const [color, setColor] = useState("SPECTATE");
    const [selectedPiece, setSelectedPiece] = useState({
        validMoves: [],
        id: ""
    });
    const [awaitingPromotion, setAwaitingPromotion] = useState(null);
    const [checkmate, setCheckmate] = useState(false);
    
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

    /*
    useEffect(() => {
        if (awaitingPromotion != null) {
            var file = awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
            var rank = awaitingPromotion[1] - 1;
            var board = gameState.board;
            if (color == "WHITE") {
                board[file][rank] = {
                    type: "Queen",
                    color: "WHITE"
                };
                board[file][rank - 1] = {
                    type: "Rook",
                    color: "WHITE"
                };
                board[file][rank - 2] = {
                    type: "Knight",
                    color: "WHITE"
                };
                board[file][rank - 3] = {
                    type: "Bishop",
                    color: "WHITE"
                };
            } else if (color == "BLACK") {
                board[file][rank] = {
                    type: "Queen",
                    color: "BLACK"
                };
                board[file][rank + 1] = {
                    type: "Rook",
                    color: "BLACK"
                };
                board[file][rank + 2] = {
                    type: "Knight",
                    color: "BLACK"
                };
                board[file][rank + 3] = {
                    type: "Bishop",
                    color: "BLACK"
                };
            }
            setGameState({
                board: board,
                toMove: gameState.toMove,
                turnCount: gameState.turnCount
            });
        }
    }, [awaitingPromotion]);
    */
    const move = (src, dst) => {
        if (toMove == true) {
            var data = {src: src, dst: dst, userId: sessionId}
            fetch("api/Game/move", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(response => {
                    console.log(response);
                    if (response.moveResult == "MOVED") {
                        setGameState(response.gamestate);
                        setToMove(false);
                    } else if (response.moveResult == "AWAITING_PROMOTION") {
                        setAwaitingPromotion(dst);
                    } else if (response.moveResult == "CHECKMATE") {
                        setGameState(response.gamestate);
                        setCheckmate(true);
                    }
                });
        }
    };
    
    const Board = () => {
        if (gameState != 0)
            return (
                <div style={{ maxWidth: "480px" }}>
                    <GridList cellHeight={60} cols={8} spacing={0}>
                        {gameState.board.map((row, i1) => row.map((tile, i2) => (
                            <Square i1={i1} i2={i2} tile={tile} />
                    )))}
                </GridList>
                </div>
            );
        else return null;
    }
    var squares = [];
    const Board2 = () => {
        if (gameState.turnCount != 0) {
            squares = Squares();
            return (
                <div className={'board'}>
                    <GridList cellHeight={60} cols={8} spacing={0}>
                        {squares.map((row) => row.map((tile) => (
                            <div>
                                {tile}
                            </div>
                        )))}
                    </GridList>
                </div>
            );
        }
            
        else return null;
    }

    var draggedPiece;

    const dragStartPiece = (e, f, r) => {
        highlightValidMoves(f, r);
        draggedPiece = { piece: gameState.board[f][r], id: e.currentTarget.id };
    }

    const dropPiece = (e) => {
        e.preventDefault();
        if (draggedPiece.piece.color == color && toMove == true) {
            let file = Number.parseInt(e.currentTarget.getAttribute('f'));
            let rank = Number.parseInt(e.currentTarget.getAttribute('r'));
           
            if (draggedPiece.piece.validMoves.find(m => m.file == file && m.rank == rank) != undefined) {

                move(draggedPiece.id, e.currentTarget.id);
            }
        }
    }

    const Tile = (props) => {
        var square = gameState.board[props.f][props.r];
        var tile;
        var file = String.fromCharCode('A'.charCodeAt() + props.f);
        var rank = props.r + 1;
        if (square != null) {
            tile = (
                <div
                    
                >
                    <GridListTile
                        draggable
                        onDragStart={(e) => dragStartPiece(e, props.f, props.r)}
                        onDragEnd={e => setSelectedPiece({ validMoves: [], id: '' })}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => dropPiece(e)}
                        onClick={(e) => onSquareClick(props.f, props.r, e)}
                        cols={1} id={file + rank}
                        className={props.class}
                        f={props.f}
                        r={props.r}
                    >
                        <PieceImage color={square.color} type={square.type} />
                    </GridListTile>
                </div>
            );
        } else {
            tile = (
                <div
                    
                    onDragOver={e => e.preventDefault()}
                >
                    <GridListTile onClick={(e) => onSquareClick(props.f, props.r, e)} onDrop={e => dropPiece(e)} id={file + rank} cols={1} className={props.class} f={props.f} r={props.r}>
                    </GridListTile>
                </div>
            );
        }

        return tile;
    }

    const PromotionTile = (props) => {
        return (
            <div onClick={() => promote(props.type)}>
                <GridListTile cols={1} className={'highlighted-square'}>
                    <PieceImage color={props.color} type={props.type} />
                </GridListTile>
            </div>
        );
    }

    
    var Squares = () => {
        //var squares = [];
        if (color == 'WHITE') {
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
            selectedPiece.validMoves.forEach((square) => {
                squares[7 - square.rank][square.file] = (<Tile f={square.file} r={square.rank} class={'highlighted-square'} />);
            });
            if (awaitingPromotion != null) {
                var file = awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
                var rank = awaitingPromotion[1] - 1;
                if (color == "WHITE") {
                    squares[7 - rank][file] = (<PromotionTile color={"WHITE"} type={"Queen"} />);
                    squares[7 - rank + 1][file] = (<PromotionTile color={"WHITE"} type={"Rook"} />);
                    squares[7 - rank + 2][file] = (<PromotionTile color={"WHITE"} type={"Knight"} />);
                    squares[7 - rank + 3][file] = (<PromotionTile color={"WHITE"} type={"Bishop"} />);
                } else if (color == "BLACK") {
                    squares[7 - rank][file] = (<PromotionTile color={"BLACK"} type={"Queen"} />);
                    squares[7 - rank - 1][file] = (<PromotionTile color={"BLACK"} type={"Rook"} />);
                    squares[7 - rank - 2][file] = (<PromotionTile color={"BLACK"} type={"Knight"} />);
                    squares[7 - rank - 3][file] = (<PromotionTile color={"BLACK"} type={"Bishop"} />);
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
            selectedPiece.validMoves.forEach((square) => {
                squares[square.rank][7-square.file] = (<Tile f={square.file} r={square.rank} class={'highlighted-square'} />);
            });
            if (awaitingPromotion != null) {
                var file = awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
                var rank = awaitingPromotion[1] - 1;
                if (color == "WHITE") {
                    squares[rank][file] = (<PromotionTile color={"WHITE"} type={"Queen"} />);
                    squares[rank + 1][file] = (<PromotionTile color={"WHITE"} type={"Rook"} />);
                    squares[rank + 2][file] = (<PromotionTile color={"WHITE"} type={"Knight"} />);
                    squares[rank + 3][file] = (<PromotionTile color={"WHITE"} type={"Bishop"} />);
                } else if (color == "BLACK") {
                    squares[rank][7-file] = (<PromotionTile color={"BLACK"} type={"Queen"} />);
                    squares[rank + 1][7-file] = (<PromotionTile color={"BLACK"} type={"Rook"} />);
                    squares[rank + 2][7-file] = (<PromotionTile color={"BLACK"} type={"Knight"} />);
                    squares[rank + 3][7-file] = (<PromotionTile color={"BLACK"} type={"Bishop"} />);
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

        if (toMove == true) {
            if (selectedPiece.validMoves.find((move) => move.file == f && move.rank == r) != undefined) {
                move(selectedPiece.id, e.currentTarget.id);
                setSelectedPiece({ validMoves: [], id: "" });
            } else if (gameState.board[f][r] != null &&
                gameState.board[f][r].color == color &&
                gameState.board[f][r].validMoves != null) {
                setSelectedPiece({ validMoves: gameState.board[f][r].validMoves, id: e.currentTarget.id });
            } else if (gameState.board[f][r] == null) {
                setSelectedPiece({ validMoves: [], id: "" });
            }
        }
    }

    const highlightValidMoves = (f, r) => {
        if (toMove == true) {
            var validMoves = gameState.board[f][r].validMoves;
            validMoves.forEach(move => {
                var file = String.fromCharCode(move.file + 'A'.charCodeAt());
                var rank = move.rank + 1;
                document.getElementById(file + rank).className = 'highlighted-square';
            });
        }
    }

    const promote = (type) => {
        var data = { userId: sessionId, pieceType: type };
        fetch("api/Game/promote", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(response => {
                if (response.moveResult == "MOVED") {
                    setAwaitingPromotion(null);
                    setGameState(response.gamestate);
                    setToMove(false);
                }
            });
    }

    const PieceImage = (tile) => {
        
        var path = "../images/" + tile.color + "_" + tile.type + ".png";
        if (tile.color == "WHITE") {
            switch (tile.type) {
                case 'Pawn':
                    return (<img src={require('../images/WHITE_Pawn.png')} height="60px" width="60px" />);
                case 'Knight':
                    return (<img src={require('../images/WHITE_Knight.png')} height="60px" width="60px"/>);
                case 'Bishop':
                    return (<img src={require('../images/WHITE_Bishop.png')} height="60px" width="60px"/>);
                case 'Rook':
                    return (<img src={require('../images/WHITE_Rook.png')} height="60px" width="60px"/>);
                case 'Queen':
                    return (<img src={require('../images/WHITE_Queen.png')} height="60px" width="60px"/>);
                case 'King':
                    return (<img src={require('../images/WHITE_King.png')} height="60px" width="60px"/>);
            }
        } else {
            switch (tile.type) {
                case 'Pawn':
                    return (<img src={require('../images/BLACK_Pawn.png')} height="60px" width="60px"/>);
                case 'Knight':
                    return (<img src={require('../images/BLACK_Knight.png')} height="60px" width="60px"/>);
                case 'Bishop':
                    return (<img src={require('../images/BLACK_Bishop.png')} height="60px" width="60px"/>);
                case 'Rook':
                    return (<img src={require('../images/BLACK_Rook.png')} height="60px" width="60px"/>);
                case 'Queen':
                    return (<img src={require('../images/BLACK_Queen.png')} height="60px" width="60px"/>);
                case 'King':
                    return (<img src={require('../images/BLACK_King.png')} height="60px" width="60px"/>);
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

    const EndGame = () => {
        var winner;
        if (gameState.toMove == "WHITE")
            winner = "BLACK";
        else
            winner = "WHITE";
        return (
            <Dialog open={checkmate} fullWidth={true} maxWidth={'xs'}>
                <DialogTitle id="dialog-title">Game over!</DialogTitle>
                <div class="winner">
                    {winner} wins
                </div>
                <Button variant="contained" size="large" color="primary" className={classes.button} onClick={() => Rematch()}>Play again</Button>
            </Dialog>
        );
    }

    const Rematch = () => {
        window.location.reload(false);
    }

    return (
        <div className={'board-container'}>
            <Board2 />
            <EndGame />
        </div>
    );
}