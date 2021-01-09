import React from 'react';
import { GridList, GridListTile, Dialog, DialogTitle, Typography, Button, Container } from '@material-ui/core';
import WHITE_QUEEN from '../images/WHITE_Queen.png';
import WHITE_ROOK from '../images/WHITE_Rook.png';
import WHITE_BISHOP from '../images/WHITE_Bishop.png';
import WHITE_KNIGHT from '../images/WHITE_Knight.png';
import WHITE_PAWN from '../images/WHITE_Pawn.png';
import WHITE_KING from '../images/WHITE_King.png';
import BLACK_QUEEN from '../images/BLACK_Queen.png';
import BLACK_ROOK from '../images/BLACK_Rook.png';
import BLACK_BISHOP from '../images/BLACK_Bishop.png';
import BLACK_KNIGHT from '../images/BLACK_Knight.png';
import BLACK_PAWN from '../images/BLACK_Pawn.png';
import BLACK_KING from '../images/BLACK_King.png';
import { PieceType, Color, drawStates } from '../enums';

function squaresAreEqual(prevSquare, nextSquare) {
    if (prevSquare.square == null && nextSquare.square == null)
        return true;
    else if (prevSquare.square == null)
        return false;
    else if (nextSquare.square == null)
        return false
    else 
    return prevSquare.square.color == nextSquare.square.color &&
        prevSquare.square.type == nextSquare.square.type;
}

function _Square(props) {
    let file = String.fromCharCode('A'.charCodeAt() + props.f);
    let rank = props.r + 1;
    console.log(file + rank);
    let squareColor;
    if ((props.f + props.r) % 2 == 0)
        squareColor = 'white-square';
    else
        squareColor = 'black-square';
    let image;
    if (props.square != null) {
        image = <PieceImage color={props.square.color} type={props.square.type} />
    }
    /*
    return (
        <GridListTile
            draggable
            onDragStart = {(e) => dragStartPiece(e, f, r)}
onDragEnd = { e => setSelectedPiece({ validMoves: [], id: '' }) }
onDragOver = { e => e.preventDefault() }
onDrop = { e => dropPiece(e) }
onClick = {(e) => onSquareClick(f, r, e)}
            cols={1} id={file + rank}
            className={squareColor}
            f={f}
            r={r}
        >
            {image}
        </GridListTile>
    );

    */

    return (
        <GridListTile
            draggable
            onDragStart={e => props.dragStart(e, props.f, props.r)}
            onDragEnd={props.dragEnd}
            onDragOver={props.dragOver}
            onDrop={props.drop}
            cols={1} id={file + rank}
            className={squareColor}
            f={props.f}
            r={props.r}
        >
            {image}
        </GridListTile>
    );
}

export const Square = React.memo(_Square, squaresAreEqual);


const PieceImage = (tile) => {

    var path = "../images/" + tile.color + "_" + tile.type + ".png";
    if (tile.color == Color.WHITE) {
        switch (tile.type) {
            case PieceType.PAWN:
                return (<img src={WHITE_PAWN} height="60px" width="60px" />);
            case PieceType.KNIGHT:
                return (<img src={WHITE_KNIGHT} height="60px" width="60px" />);
            case PieceType.BISHOP:
                return (<img src={WHITE_BISHOP} height="60px" width="60px" />);
            case PieceType.ROOK:
                return (<img src={WHITE_ROOK} height="60px" width="60px" />);
            case PieceType.QUEEN:
                return (<img src={WHITE_QUEEN} height="60px" width="60px" />);
            case PieceType.KING:
                return (<img src={WHITE_KING} height="60px" width="60px" />);
        }
    } else {
        switch (tile.type) {
            case PieceType.PAWN:
                return (<img src={BLACK_PAWN} height="60px" width="60px" />);
            case PieceType.KNIGHT:
                return (<img src={BLACK_KNIGHT} height="60px" width="60px" />);
            case PieceType.BISHOP:
                return (<img src={BLACK_BISHOP} height="60px" width="60px" />);
            case PieceType.ROOK:
                return (<img src={BLACK_ROOK} height="60px" width="60px" />);
            case PieceType.QUEEN:
                return (<img src={BLACK_QUEEN} height="60px" width="60px" />);
            case PieceType.KING:
                return (<img src={BLACK_KING} height="60px" width="60px" />);
        }
    }
} 

function _Board3({ gameState, dragEnd, dragStart, dragOver, drop }) {
    let f = [0, 1, 2, 3, 4, 5, 6, 7];
    let r = [f, f, f, f, f, f, f, f];
    if (gameState.turnCount > 0) {
        return (
            <div className={'board'}>
                <GridList cellHeight={'auto'} cols={8} spacing={0}>
                    {r.map((x, rank) => x.map((file) => (
                        <Square
                            square={gameState.board[file][7 - rank]}
                            f={file}
                            r={7 - rank}
                            dragStart={dragStart}
                            dragEnd={dragEnd}
                            dragOver={dragOver}
                            drop={drop}
                            key={file * 10 + rank} />
                    )))}
                </GridList>
            </div>
        );
    } else return null;
}

export const Board3 = _Board3;

/*
var squares = [];
const Board2 = () => {
    if (gameState.turnCount != 0) {
        squares = Squares();
        return (
            <div className={'board'}>
                <GridList cellHeight={'auto'} cols={8} spacing={0}>
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

const Tile = React.memo((props) => {
    var tile;
    console.log(props.square);
    var file = String.fromCharCode('A'.charCodeAt() + props.f);
    var rank = props.r + 1;
    var label = null;
    if (color == Color.WHITE || color == Color.SPECTATE) {
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

    if (props.square != undefined) {
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
                    {label}
                    <PieceImage color={props.square.color} type={props.square.type} />
                </GridListTile>
            </div>
        );
    } else {
        tile = (
            <div

                onDragOver={e => e.preventDefault()}
            >
                <GridListTile onClick={(e) => onSquareClick(props.f, props.r, e)} onDrop={e => dropPiece(e)} id={file + rank} cols={1} className={props.class} f={props.f} r={props.r}>
                    {label}
                </GridListTile>
            </div>
        );
    }

    return tile;
});

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
    if (color == Color.WHITE) {
        for (var j = 0; j < 8; j++) {
            squares[j] = [];
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 == 0)
                    squares[7 - i][j] = (<Tile f={j} r={i} class={'white-square'} square={gameState.board[j][i]} />);
                else
                    squares[7 - i][j] = (<Tile f={j} r={i} class={'black-square'} square={gameState.board[j][i]} />);
            }
        }
        selectedPiece.validMoves.forEach((square) => {
            squares[7 - square.rank][square.file] = (<Tile f={square.file} r={square.rank} class={'highlighted-square'} />);
        });
        if (awaitingPromotion != null) {
            var file = awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
            var rank = awaitingPromotion[1] - 1;
            if (color == Color.WHITE) {
                squares[7 - rank][file] = (<PromotionTile color={Color.WHITE} type={PieceType.QUEEN} />);
                squares[7 - rank + 1][file] = (<PromotionTile color={Color.WHITE} type={PieceType.ROOK} />);
                squares[7 - rank + 2][file] = (<PromotionTile color={Color.WHITE} type={PieceType.KNIGHT} />);
                squares[7 - rank + 3][file] = (<PromotionTile color={Color.WHITE} type={PieceType.BISHOP} />);
            } else if (color == Color.BLACK) {
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
                    squares[i][7 - j] = (<Tile f={j} r={i} class={'white-square'} square={gameState.board[j][i]} />);
                else
                    squares[i][7 - j] = (<Tile f={j} r={i} class={'black-square'} square={gameState.board[j][i]} />);
            }
        }
        selectedPiece.validMoves.forEach((square) => {
            squares[square.rank][7 - square.file] = (<Tile f={square.file} r={square.rank} class={'highlighted-square'} />);
        });
        if (awaitingPromotion != null) {
            var file = awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
            var rank = awaitingPromotion[1] - 1;
            if (color == Color.WHITE) {
                squares[rank][file] = (<PromotionTile color={Color.WHITE} type={PieceType.QUEEN} />);
                squares[rank + 1][file] = (<PromotionTile color={Color.WHITE} type={PieceType.ROOK} />);
                squares[rank + 2][file] = (<PromotionTile color={Color.WHITE} type={PieceType.KNIGHT} />);
                squares[rank + 3][file] = (<PromotionTile color={Color.WHITE} type={PieceType.BISHOP} />);
            } else if (color == Color.BLACK) {
                squares[rank][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.QUEEN} />);
                squares[rank + 1][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.ROOK} />);
                squares[rank + 2][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.KNIGHT} />);
                squares[rank + 3][7 - file] = (<PromotionTile color={Color.BLACK} type={PieceType.BISHOP} />);
            }
        }
        return squares;
    }

}
*/