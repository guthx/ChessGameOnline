import { PieceType, Color } from '../../enums';

export default class Piece {
    constructor(file, rank, color) {
        this.symbol = null;
        this.file = file;
        this.rank = rank;
        this.type = null;
        this.color = color;
        this.memoValidMoves = null;
    }

    pseudoValidMoves(board) {
        throw new Error("Can't find moves for abstract piece");
    }

    isAttackingSquare(square, board) {
        throw new Error("Can't find moves for abstract piece");
    }

    validMoves(gamestate) {
        if (this.memoValidMoves != null)
            return this.memoValidMoves;

        var validMoves = this.pseudoValidMoves(gamestate.board);
        var attackingPieces = this.color == Color.WHITE ? gamestate.blackPieces : gamestate.whitePieces;
        var king = this.color == Color.WHITE ? gamestate.whiteKing : gamestate.blackKing;
        var movesToDelete = [];

        gamestate.board[this.file][this.rank] = null;

        validMoves = validMoves.filter(move => {
            var previousPiece = gamestate.board[move.file][move.rank];
            gamestate.board[move.file][move.rank] = this;
            var result = !attackingPieces.some(piece => {
                if (!(piece.file == move.file && piece.rank == move.rank) && piece.type != PieceType.PAWN) {
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

    isAttacked(gamestate) {
        var attackingPieces = this.color == Color.WHITE ? gamestate.blackPieces : gamestate.whitePieces;

        return attackingPieces.some(piece => {
            piece.isAttackingSquare({ file: this.file, rank: this.rank }, gamestate.board);
        });
    }
}
