﻿import React, { useEffect, useState, useRef } from 'react'
import { Color } from '../../enums';
import Square from './Square';
import Label from './Label';

export default function Board({ gamestate, awaitingPromotion, color, move, promote }) {
    const [squares, setSquares] = useState([]);
    const [hSquares, setHSquares] = useState([]);
    const [selectedPiece, setSelectedPiece] = useState({
        element: null,
        square: null
    });

    useEffect(() => {
        if (gamestate.board.length > 0) {
            let sq = [];
            for (let r = 7; r >= 0; r--) {
                for (let f = 0; f < 8; f++) {
                    let symbol;
                    let backgroundClass;
                    if (gamestate.board[f][r] == null)
                        symbol = '-';
                    else
                        symbol = gamestate.board[f][r].symbol;
                    if ((r + f) % 2 != 0)
                        backgroundClass = 'white-square';
                    else
                        backgroundClass = 'black-square';
                    sq.push({
                        symbol: symbol,
                        backgroundClass: backgroundClass,
                        highlighted: false,
                        selected: false,
                        moved: false,
                        promotion: false,
                        file: f,
                        rank: r,
                        color: color
                    });
                }
            }
            if (gamestate.lastMove != null && gamestate.lastMove.item1 != null) {
                let from = gamestate.lastMove.item1;
                let to = gamestate.lastMove.item2;
                sq[index(from.file, from.rank)].moved = true;
                sq[index(to.file, to.rank)].moved = true;
            }
            setSquares(sq);
            setHSquares([]);
        }
    }, [gamestate]);

    useEffect(() => {
        if (awaitingPromotion != null) {
            let sq = squares.slice();
            var file = awaitingPromotion[0].charCodeAt() - 'A'.charCodeAt();
            var rank = awaitingPromotion[1] - 1;
            if (color == Color.WHITE || color == Color.SPECTATE) {
                sq[index(file, rank)].symbol = 'Q'
                sq[index(file, rank)].promotion = true;
                sq[index(file, rank - 1)].symbol = 'R'
                sq[index(file, rank - 1)].promotion = true;
                sq[index(file, rank - 2)].symbol = 'N'
                sq[index(file, rank - 2)].promotion = true;
                sq[index(file, rank - 3)].symbol = 'B'
                sq[index(file, rank - 3)].promotion = true;
            }
            else {
                sq[index(file, rank)].symbol = 'q';
                sq[index(file, rank)].promotion = true;
                sq[index(file, rank + 1)].symbol = 'r';
                sq[index(file, rank + 1)].promotion = true;
                sq[index(file, rank + 2)].symbol = 'n';
                sq[index(file, rank + 2)].promotion = true;
                sq[index(file, rank + 3)].symbol = 'b';
                sq[index(file, rank + 3)].promotion = true;
            }
            setSquares(sq);
        }
    }, [awaitingPromotion]);


    const mouseDown = (f, r, piece) => {
        let i = index(f, r);
        if (color == gamestate.toMove) {
            if (hSquares.includes(i)) {
                let j = index(selectedPiece.square.file, selectedPiece.square.rank);
                let sq = squares.slice();
                sq[i].symbol = selectedPiece.square.symbol;
                sq[j].symbol = '-';
                setSquares(sq);
                clearHighlight();
                //TODO Move
                let src = String.fromCharCode(selectedPiece.square.file + 65) + (selectedPiece.square.rank + 1);
                let dst = String.fromCharCode(f + 65) + (r + 1);
                move(src, dst);
            }
            else {
                if (gamestate.board[f][r] != null &&
                    gamestate.board[f][r].color == color) {
                    clearHighlight();
                    if (gamestate.board[f][r].validMoves.length > 0) {
                        highlightValidMoves(f, r);
                        setSelectedPiece({
                            element: piece,
                            square: squares[index(f, r)]
                        });
                    }                  
                }
                else {
                    clearHighlight();
                    setSelectedPiece({
                        element: null,
                        square: null
                    });
                }
            }
        }
    }

    const mouseMove = (e) => {
        let cursor_x = e.pageX;
        let cursor_y = e.pageY;
        if (selectedPiece.element != null) {
            var x_offset = cursor_x - selectedPiece.element.x;
            var y_offset = cursor_y - selectedPiece.element.y;
            selectedPiece.element.style.transform = "translate(calc(" + x_offset + "px - 5vh), calc(" + y_offset + "px - 5vh))";
        }
        e.preventDefault();
    }

    const index = (f, r) => {
        return 63 - (r * 8 + 7 - f);
    };
    const highlightValidMoves = (f, r) => {

        let sq = squares.slice();
        let hsq = [];
        gamestate.board[f][r].validMoves.forEach(move => {
            let i = index(move.file, move.rank);
            sq[i].highlighted = true;
            hsq.push(i.valueOf());
        });
        setSquares(sq);
        setHSquares(hsq);
    };

    const clearHighlight = () => {
        let sq = squares.slice();
        hSquares.forEach(hsq => {
            sq[hsq].highlighted = false;
        });
        setSquares(sq);
        setHSquares([]);
    }

    const mouseUp = (e, f, r) => {
        if (selectedPiece.element != null) {
            let i = index(f, r);
            if (hSquares.includes(i)) {
                let j = index(selectedPiece.square.file, selectedPiece.square.rank);
                let sq = squares.slice();
                let src = String.fromCharCode(selectedPiece.square.file + 65) + (selectedPiece.square.rank + 1);
                let dst = String.fromCharCode(f + 65) + (r + 1);
                
                sq[i].symbol = selectedPiece.square.symbol;
                sq[j].symbol = '-';
                setSquares(sq);
                clearHighlight();
                
                selectedPiece.element.style.transform = '';
                setSelectedPiece({
                    square: null,
                    element: null
                });
                move(src, dst);
            }
            else {
                selectedPiece.element.style.transform = '';
                setSelectedPiece({
                    ...selectedPiece,
                    element: null
                });
            }
        }
    }



    if (squares.length == 0)
        return null;
    else {
        if (color == Color.WHITE || color == Color.SPECTATE)
            return (
                <div
                    onMouseMove={e => mouseMove(e)}
                    onMouseLeave={e => mouseUp(e)}
                    className={'board'}>
                    {squares.map((square, i) => (
                            <Square
                                state={square}
                                key={i}
                                mouseDown={mouseDown}
                                mouseUp={mouseUp}
                                promote={promote}
                            />
                    ))}
                </div>
            );
        else
            return (
                <div onMouseMove={e => mouseMove(e)} className={'board'}>
                    {squares.slice().reverse().map((square, i) => (
                            <Square
                                state={square}
                                key={i}
                                mouseDown={mouseDown}
                                mouseUp={mouseUp}
                                promote={promote}
                            />
                    ))}
                </div>
            );
    }
    
}
