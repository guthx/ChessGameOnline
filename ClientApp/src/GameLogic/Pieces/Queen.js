import Piece from './Piece';
import Rook from './Rook';
import Bishop from './Bishop';
import { PieceType, Color } from '../../enums';

export default class Queen extends Piece {
    constructor(file, rank, color) {
        super(file, rank, color);
        this.type = PieceType.QUEEN;
        this.symbol = this.color === Color.WHITE ? 'Q' : 'q';
    }

    pseudoValidMoves(board) {
        var rook = new Rook(this.file, this.rank, this.color);
        var bishop = new Bishop(this.file, this.rank, this.color);
        var moves1 = rook.pseudoValidMoves(board);
        var moves2 = bishop.pseudoValidMoves(board);
        return moves1.concat(moves2);
    }

    isAttackingSquare(square, board) {
        var rook = new Rook(this.file, this.rank, this.color);
        board[this.file][this.rank] = rook;
        var isRookAttacking = rook.isAttackingSquare(square, board);
        var bishop = new Bishop(this.file, this.rank, this.color);
        board[this.file][this.rank] = bishop;
        var isBishopAttacking = bishop.isAttackingSquare(square, board);
        board[this.file][this.rank] = this;
        return isRookAttacking || isBishopAttacking;
    }
}