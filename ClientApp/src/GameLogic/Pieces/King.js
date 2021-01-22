import Piece from './Piece';
import { PieceType, Color } from '../../enums';

export default class King extends Piece {
    constructor(file, rank, color) {
        super(file, rank, color);
        this.type = PieceType.KING;
        this.symbol = this.color == Color.WHITE ? 'K' : 'k';
    }

    pseudoValidMoves(board) {
        var validMoves = [];
        for (var f = -1; f <= 1; f++) {
            for (var r = -1; r <= 1; r++) {
                if (!(f == 0 && r == 0) && this.file + f >= 0 && this.file + f <= 7 &&
                    this.rank + r >= 0 && this.rank + r <= 7 &&
                    (board[this.file + f][this.rank + r] == null || board[this.file + f][this.rank + r].color != this.color))
                    validMoves.push({ file: this.file + f, rank: this.rank + r });
            }
        }
        return validMoves;
    }

    validMoves(gamestate) {
        if (this.memoValidMoves != null)
            return this.memoValidMoves;
        var validMoves = this.pseudoValidMoves(gamestate.board);
        var attackingPieces = this.color == Color.WHITE ? gamestate.blackPieces : gamestate.whitePieces;

        gamestate.board[this.file][this.rank] = null;
        validMoves = validMoves.filter(move => {
            var previousPiece = gamestate.board[move.file][move.rank];
            gamestate.board[move.file][move.rank] = this;
            var result = !attackingPieces.some(piece => {
                if (!(piece.file == move.file && piece.rank == move.rank)) {
                    if (piece.isAttackingSquare(move, gamestate.board)) {
                        return true;
                    }

                }
                return false;
            });
            gamestate.board[move.file][move.rank] = previousPiece;
            return result;
        });
        gamestate.board[this.file][this.rank] = this;

        const areSquaresAttacked = (squares) => {
            attackingPieces.forEach(piece => {
                squares.forEach(square => {
                    if (piece.isAttackingSquare(square, gamestate.board))
                        return true;
                });
            });
            return false;
        };

        if (this.color == Color.WHITE) {
            var squares = [{ file: 4, rank: 0 }, { file: 5, rank: 0 }, { file: 6, rank: 0 }];
            if (gamestate.whiteCanCastleKingside &&
                gamestate.board[5][0] == null &&
                gamestate.board[6][0] == null &&
                !areSquaresAttacked(squares))
                validMoves.push({ file: 6, rank: 0 });

            squares[1] = { file: 3, rank: 0 };
            squares[2] = { file: 2, rank: 0 };
            if (gamestate.whiteCanCastleQueenside &&
                gamestate.board[1][0] == null &&
                gamestate.board[2][0] == null &&
                gamestate.board[3][0] == null &&
                !areSquaresAttacked(squares))
                validMoves.push({ file: 2, rank: 0 });
        }
        else {
            var squares = [{ file: 4, rank: 7 }, { file: 5, rank: 7 }, { file: 6, rank: 7 }];
            if (gamestate.blackCanCastleKingside &&
                gamestate.board[5][7] == null &&
                gamestate.board[6][7] == null &&
                !areSquaresAttacked(squares))
                validMoves.push({ file: 6, rank: 7 });

            squares[1] = { file: 3, rank: 7 };
            squares[2] = { file: 2, rank: 7 };
            if (gamestate.blackCanCastleQueenside &&
                gamestate.board[1][7] == null &&
                gamestate.board[2][7] == null &&
                gamestate.board[3][7] == null &&
                !areSquaresAttacked(squares))
                validMoves.push({ file: 2, rank: 7 });

        }
        this.memoValidMoves = validMoves;
        return validMoves;
    }

    isAttackingSquare(square, board) {
        var fileOffset = this.file - square.file;
        var rankOffset = this.rank - square.rank;
        if (fileOffset >= -1 && fileOffset <= 1 && rankOffset >= -1 && rankOffset <= 1)
            return true;
        else return false;
    }

    isChecked(gamestate) {
        var attackingPieces = this.color == Color.WHITE ? gamestate.blackPieces : gamestate.whitePieces;
        return attackingPieces.some(piece => {
            if (piece.isAttackingSquare({ file: this.file, rank: this.rank }, gamestate.board)) {
                return true;
            }
        });
    }

    possibleSquares() {
        var possibleSquares = [];
        for (var f = -1; f <= 1; f++) {
            for (var r = -1; r <= 1; r++) {
                if (!(f == 0 && r == 0) && this.file + f >= 0 && this.file + f <= 7 &&
                    this.rank + r >= 0 && this.rank + r <= 7)
                    possibleSquares.push({ file: this.file + f, rank: this.rank + r });
            }
        }
        return possibleSquares;
    }
}