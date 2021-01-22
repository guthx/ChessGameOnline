import Piece from './Piece';
import { PieceType, Color } from '../../enums';

export default class Knight extends Piece {
    constructor(file, rank, color) {
        super(file, rank, color);
        this.type = PieceType.KNIGHT;
        this.symbol = this.color == Color.WHITE ? 'N' : 'n';
    }

    pseudoValidMoves(board) {
        var moveOffsets = [ [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1] ];
        var validMoves = [];

        for (var i = 0; i < 8; i++) {
            var newfile = this.file + moveOffsets[i][0];
            var newrank = this.rank + moveOffsets[i][1];
            if (newfile >= 0 && newfile < 8 && newrank >= 0 && newrank < 8 &&
                (board[newfile][newrank] == null || board[newfile][newrank].color != this.color))
                validMoves.push({ file: newfile, rank: newrank });
        }

        return validMoves;
    }

    isAttackingSquare(square, board) {
        var absfileOffset = Math.abs(this.file - square.file);
        var absrankOffset = Math.abs(this.rank - square.rank);
        if ((absfileOffset == 2 && absrankOffset == 1) || (absfileOffset == 1 && absrankOffset == 2))
            return true;
        else return false;
    }

    possibleSquares() {
        var moveOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        var possibleSquares = [];

        for (var i = 0; i < 8; i++) {
            var newfile = this.file + moveOffsets[i][0];
            var newrank = this.rank + moveOffsets[i][1];
            if (newfile >= 0 && newfile < 8 && newrank >= 0 && newrank < 8)
                possibleSquares.push({ file: newfile, rank: newrank });
        }

        return possibleSquares;
    }
}