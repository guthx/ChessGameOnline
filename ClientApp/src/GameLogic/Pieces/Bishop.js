import Piece from './Piece';
import { PieceType, Color } from '../../enums';

export default class Bishop extends Piece {
    constructor(file, rank, color) {
        super(file, rank, color);
        this.type = PieceType.BISHOP;
        this.symbol = this.color == Color.WHITE ? 'B' : 'b';
    }

    pseudoValidMoves(board) {
        var validMoves = [];
        var f, r;
        //up-right movement
        f = 1;
        r = 1;
        while (this.file + f < 8 && this.rank + r < 8) {
            var nFile = this.file + f;
            var nRank = this.rank + r;
            if (board[nFile][nRank] == null) {
                validMoves.push({ file: nFile, rank: nRank });
            }
            else if (board[nFile][nRank].color != this.color) {
                validMoves.push({ file: nFile, rank: nRank });
                break;
            }
            else break;
            f++;
            r++;
        }
        //up-left movement
        f = -1;
        r = 1;
        while (this.file + f >= 0 && this.rank + r < 8) {
            var nFile = this.file + f;
            var nRank = this.rank + r;
            if (board[nFile][nRank] == null) {
                validMoves.push({ file: nFile, rank: nRank });
            }
            else if (board[nFile][nRank].color != this.color) {
                validMoves.push({ file: nFile, rank: nRank });
                break;
            }
            else break;
            f--;
            r++;
        }
        //down-right movement
        f = 1;
        r = -1;
        while (this.file + f < 8 && this.rank + r >= 0) {
            var nFile = this.file + f;
            var nRank = this.rank + r;
            if (board[nFile][nRank] == null) {
                validMoves.push({ file: nFile, rank: nRank });
            }
            else if (board[nFile][nRank].color != this.color) {
                validMoves.push({ file: nFile, rank: nRank });
                break;
            }
            else break;
            f++;
            r--;
        }
        //down-left movement
        f = -1;
        r = -1;
        while (this.file + f >= 0 && this.rank + r >= 0) {
            var nFile = this.file + f;
            var nRank = this.rank + r;
            if (board[nFile][nRank] == null) {
                validMoves.push({ file: nFile, rank: nRank });
            }
            else if (board[nFile][nRank].color != this.color) {
                validMoves.push({ file: nFile, rank: nRank });
                break;
            }
            else break;
            f--;
            r--;
        }
        return validMoves;
    }

    isAttackingSquare(square, board) {
        var fileOffset = square.file - this.file;
        var rankOffset = square.rank - this.rank;
        if (Math.abs(fileOffset) == Math.abs(rankOffset)) {
            var fileDirection;
            var rankDirection;
            if (fileOffset > 0)
                fileDirection = 1;
            else fileDirection = -1;
            if (rankOffset > 0)
                rankDirection = 1;
            else rankDirection = -1;

            for (var i = 1; i < Math.abs(fileOffset); i++)
            {
                if (board[this.file + i * fileDirection][this.rank + i * rankDirection] != null)
                    return false;
            }
            return true;
        }
        else return false;
    }

}