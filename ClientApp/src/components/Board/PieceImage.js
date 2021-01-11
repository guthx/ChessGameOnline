import React from 'react';
import WHITE_QUEEN from '../../images/cburnett/wQ.svg';
import WHITE_ROOK from '../../images/cburnett/wR.svg';
import WHITE_BISHOP from '../../images/cburnett/wB.svg';
import WHITE_KNIGHT from '../../images/cburnett/wN.svg';
import WHITE_PAWN from '../../images/cburnett/wP.svg';
import WHITE_KING from '../../images/cburnett/wK.svg';
import BLACK_QUEEN from '../../images/cburnett/bQ.svg';
import BLACK_ROOK from '../../images/cburnett/bR.svg';
import BLACK_BISHOP from '../../images/cburnett/bB.svg';
import BLACK_KNIGHT from '../../images/cburnett/bN.svg';
import BLACK_PAWN from '../../images/cburnett/bP.svg';
import BLACK_KING from '../../images/cburnett/bK.svg';

function PieceImage({ symbol }) {
    if (symbol != '-') {
        let img;
        switch (symbol) {
            case 'p':
                img = BLACK_PAWN;
                break;
            case 'P':
                img = WHITE_PAWN;
                break;
            case 'q':
                img = BLACK_QUEEN;
                break;
            case 'Q':
                img = WHITE_QUEEN;
                break;
            case 'r':
                img = BLACK_ROOK;
                break;
            case 'R':
                img = WHITE_ROOK;
                break;
            case 'b':
                img = BLACK_BISHOP;
                break;
            case 'B':
                img = WHITE_BISHOP;
                break;
            case 'n':
                img = BLACK_KNIGHT;
                break;
            case 'N':
                img = WHITE_KNIGHT;
                break;
            case 'k':
                img = BLACK_KING;
                break;
            case 'K':
                img = WHITE_KING;
                break;
        }

        return (
            <img src={img} height="100%" width="100%" />
        );
    }
    else return null;
}

export default React.memo(PieceImage);