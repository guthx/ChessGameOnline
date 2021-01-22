import React from 'react';
import MiniPawn from '../../images/cburnett/miniP.svg';
import MiniKnight from '../../images/cburnett/miniN.svg';
import MiniBishop from '../../images/cburnett/miniB.svg';
import MiniRook from '../../images/cburnett/miniR.svg';
import MiniQueen from '../../images/cburnett/miniQ.svg';
import { PieceType, Color } from '../../enums';

function PieceDifference({ pieceDifference, color, points }) {
    var images = [];
    if (color == Color.WHITE) {
        if (pieceDifference[PieceType.PAWN] > 0) {
            for (let i = 0; i < pieceDifference[PieceType.PAWN]; i++) {
                images.push(<img src={MiniPawn} alt="Pawn" />);
            }
        }
        if (pieceDifference[PieceType.KNIGHT] > 0) {
            for (let i = 0; i < pieceDifference[PieceType.KNIGHT]; i++) {
                images.push(<img src={MiniKnight} alt="Knight" />);
            }
        }
        if (pieceDifference[PieceType.BISHOP] > 0) {
            for (let i = 0; i < pieceDifference[PieceType.BISHOP]; i++) {
                images.push(<img src={MiniBishop} alt="Bishop" />);
            }
        }
        if (pieceDifference[PieceType.ROOK] > 0) {
            for (let i = 0; i < pieceDifference[PieceType.ROOK]; i++) {
                images.push(<img src={MiniRook} alt="Rook" />);
            }
        }
        if (pieceDifference[PieceType.QUEEN] > 0) {
            for (let i = 0; i < pieceDifference[PieceType.QUEEN]; i++) {
                images.push(<img src={MiniQueen} alt="Queen" />);
            }
        }
        if (points > 0) {
            images.push(
                <div>
                    +{points}
                </div>
            );
        }
    }
    else {
        if (pieceDifference[PieceType.PAWN] < 0) {
            for (let i = 0; i > pieceDifference[PieceType.PAWN]; i++) {
                images.push(<img src={MiniPawn} alt="Pawn" />);
            }
        }
        if (pieceDifference[PieceType.KNIGHT] < 0) {
            for (let i = 0; i > pieceDifference[PieceType.KNIGHT]; i++) {
                images.push(<img src={MiniKnight} alt="Knight" />);
            }
        }
        if (pieceDifference[PieceType.BISHOP] < 0) {
            for (let i = 0; i > pieceDifference[PieceType.BISHOP]; i++) {
                images.push(<img src={MiniBishop} alt="Bishop" />);
            }
        }
        if (pieceDifference[PieceType.ROOK] < 0) {
            for (let i = 0; i > pieceDifference[PieceType.ROOK]; i++) {
                images.push(<img src={MiniRook} alt="Rook" />);
            }
        }
        if (pieceDifference[PieceType.QUEEN] < 0) {
            for (let i = 0; i > pieceDifference[PieceType.QUEEN]; i++) {
                images.push(<img src={MiniQueen} alt="Queen" />);
            }
        }
        if (points < 0) {
            images.push(
                <div>
                    +{points}
                </div>
            );
        }
    }
    return (
        <div className={'piece-difference'}>
            {images}
        </div>
        );
    
}

export default React.memo(PieceDifference);