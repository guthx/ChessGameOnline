import Piece from './Piece';
import { PieceType, Color } from '../../enums';

export default class Pawn extends Piece {
    constructor(file, rank, color) {
        super(file, rank, color);
        this.type = PieceType.PAWN;
        this.symbol = this.color == Color.WHITE ? 'P' : 'p';
    }

    pseudoValidMoves(board) {
        var validMoves = [];
        if (this.color == Color.WHITE) {
            if (this.rank == 1) {
                if (board[this.file][2] == null) {
                    validMoves.push({ file: this.file, rank: 2 });
                    if (board[this.file][3] == null)
                        validMoves.push({ file: this.file, rank: 3 });
                }
            }
            else {
                if (board[this.file][this.rank + 1] == null)
                    validMoves.push({ file: this.file, rank: this.rank + 1 });
            }
            if (this.file > 0 && board[this.file - 1][this.rank + 1] != null
                && board[this.file - 1][ this.rank + 1].color == Color.BLACK)
                validMoves.push({ file: this.file - 1, rank:  this.rank + 1 });
            if (this.file < 7 && board[this.file + 1][ this.rank + 1] != null
                && board[this.file + 1][ this.rank + 1].color == Color.BLACK)
                validMoves.push({ file: this.file + 1, rank:  this.rank + 1 });
        }
        else {
            if (this.rank == 6) {
                if (board[this.file][ 5] == null) {
                    validMoves.push({ file: this.file, rank:  5 });
                    if (board[this.file][ 4] == null)
                        validMoves.push({ file: this.file, rank:  4 });
                }
            }
            else {
                if (board[this.file][ this.rank - 1] == null)
                    validMoves.push({ file: this.file, rank:  this.rank - 1 });
            }
            if (this.file > 0 && board[this.file - 1][ this.rank - 1] != null
                && board[this.file - 1][ this.rank - 1].color == Color.WHITE)
                validMoves.push({ file: this.file - 1, rank:  this.rank - 1 });
            if (this.file < 7 && board[this.file + 1][ this.rank - 1] != null
                && board[this.file + 1][ this.rank - 1].color == Color.WHITE)
                validMoves.push({ file: this.file + 1, rank:  this.rank - 1 });
        }

        return validMoves;
    }

    validMoves(gamestate) {
        if (this.memoValidMoves != null)
            return this.memoValidMoves;

        var validMoves = this.pseudoValidMoves(gamestate.board);

        if (gamestate.enPassantPosition != null) {
            if (this.color == Color.WHITE &&
                this.rank == 4 &&
                Math.abs(this.file - gamestate.enPassantPosition.file) == 1)
                validMoves.push(gamestate.enPassantPosition);
            else if (this.color == Color.BLACK &&
                this.rank == 3 &&
                Math.abs(this.file - gamestate.enPassantPosition.file) == 1)
                validMoves.push(gamestate.enPassantPosition);
        }

        var attackingPieces = this.color == Color.WHITE ? gamestate.blackPieces : gamestate.whitePieces;
        var king = this.color == Color.WHITE ? gamestate.whiteKing : gamestate.blackKing;
        gamestate.board[this.file][ this.rank] = null;
        validMoves = validMoves.filter(move => {
            var previousPiece = gamestate.board[move.file][move.rank];
            gamestate.board[move.file][move.rank] = this;
            var result = !attackingPieces.some(piece => {
                if (!(piece.file == move.file && piece.rank == move.rank)) {
                    if (piece.isAttackingSquare({ file: king.file, rank: king.rank }, gamestate.board)) {
                        return true;
                    }
                }
                return false;
            });
            gamestate.board[move.file][move.rank] = previousPiece;
            return result;
        });
        gamestate.board[this.file][this.rank] = this;
        this.memoValidMoves = validMoves;
        return validMoves;
    }

    isAttackingSquare(square, board) {
        if (this.color == Color.WHITE) {
            var fileOffset = this.file - square.file;
            if ((fileOffset == -1 || fileOffset == 1) && square.rank - this.rank == 1)
                return true;
            else return false;
        } else {
            var fileOffset = this.File - square.file;
            if ((fileOffset == -1 || fileOffset == 1) && square.rank - this.rank == -1)
                return true;
            else return false;
        }
    }

    possibleSquares() {
        var possibleSquares = [];
        if (this.color == Color.WHITE) {
            if (this.rank == 1) {
                possibleSquares.push({ file: this.file, rank: 2 });
                possibleSquares.push({ file: this.file, rank: 3 });
                }
            else {
                possibleSquares.push({ file: this.file, rank: this.rank + 1 });
            }
            if (this.file > 0)
                possibleSquares.push({ file: this.file - 1, rank: this.rank + 1 });
            if (this.file < 7)
                possibleSquares.push({ file: this.file + 1, rank: this.rank + 1 });
        }
        else {
            if (this.rank == 6) {
                possibleSquares.push({ file: this.file, rank: 5 });
                possibleSquares.push({ file: this.file, rank: 4 });
            }
            else {
                possibleSquares.push({ file: this.file, rank: this.rank - 1 });
            }
            if (this.file > 0)
                possibleSquares.push({ file: this.file - 1, rank: this.rank - 1 });
            if (this.file < 7)
                possibleSquares.push({ file: this.file + 1, rank: this.rank - 1 });
        }

        return possibleSquares;
    }
}
