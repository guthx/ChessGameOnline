import Piece from './Piece';
import { PieceType, Color } from '../../enums';

export default class Rook extends Piece {
    constructor(file, rank, color) {
        super(file, rank, color);
        this.type = PieceType.ROOK;
        this.symbol = this.color == Color.WHITE ? 'R' : 'r';
    }

    pseudoValidMoves(board) {
        var validMoves = [];
        for (var i = this.file + 1; i < 8; i++)
        {
            if (board[i][ this.rank] == null) {
                validMoves.push({ file: i, rank:  this.rank });
            }
            else if (board[i][ this.rank].color != this.color) {
                validMoves.push({ file: i, rank:  this.rank });
                break;
            }
            else break;
        }
        for (var i = this.file - 1; i >= 0; i--)
        {
            if (board[i][ this.rank] == null) {
                validMoves.push({ file: i, rank:  this.rank });
            }
            else if (board[i][ this.rank].color != this.color) {
                validMoves.push({ file: i, rank:  this.rank });
                break;
            }
            else break;
        }
        for (var i = this.rank + 1; i < 8; i++)
        {
            if (board[this.file][ i] == null) {
                validMoves.push({ file: this.file, rank:  i });
            }
            else if (board[this.file][ i].color != this.color) {
                validMoves.push({ file: this.file, rank:  i });
                break;
            }
            else break;
        }
        for (var i = this.rank - 1; i >= 0; i--)
        {
            if (board[this.file][ i] == null) {
                validMoves.push({ file: this.file, rank:  i });
            }
            else if (board[this.file][ i].color != this.color) {
                validMoves.push({ file: this.file, rank:  i });
                break;
            }
            else break;
        }

        return validMoves;
    }

    isAttackingSquare(square, board) {
        var fileOffset = square.file - this.file;
        var rankOffset = square.rank - this.rank;
        if (fileOffset == 0 && rankOffset != 0) {
            if (rankOffset > 0) {
                for (var i = this.rank + 1; i < square.rank; i++)
                {
                    if (board[square.file][ i] != null)
                        return false;
                }
                return true;
            }
            else {
                for (var i = this.rank - 1; i > square.rank; i--)
                {
                    if (board[square.file][ i] != null)
                        return false;
                }
                return true;
            }
        }
        else if (fileOffset != 0 && rankOffset == 0) {
            if (fileOffset > 0) {
                for (var i = this.file + 1; i < square.file; i++)
                {
                    if (board[i][ square.rank] != null)
                        return false;
                }
                return true;
            }
            else {
                for (var i = this.file - 1; i > square.file; i--)
                {
                    if (board[i][ square.rank] != null)
                        return false;
                }
                return true;
            }
        }
        else return false;
    }
}
