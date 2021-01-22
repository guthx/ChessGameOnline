import Bishop from './Pieces/Bishop';
import King from './Pieces/King';
import Knight from './Pieces/Knight';
import Pawn from './Pieces/Pawn';
import Queen from './Pieces/Queen';
import Rook from './Pieces/Rook';
import { Color, PieceType } from '../enums';

export default class Gamestate {
    constructor(fen) {
        this.board = new Array(8);
        this.whitePieces = [];
        this.blackPieces = [];
        this.whiteKing = null;
        this.blackKing = null;
        this.pieceDifference = new Array(0, 0, 0, 0, 0, 0);
        this.points = 0;
        for (var i = 0; i < 8; i++)
            this.board[i] = new Array(8);

        var splitFen = fen.split(' ');

        var f = 0, r = 7;
        for (var i = 0; i < splitFen[0].length; i++) {
            switch (splitFen[0][i]) {
                case 'Q':
                    var piece = new Queen(f, r, Color.WHITE);
                    this.board[f][r] = piece;
                    this.whitePieces.push(piece);
                    this.points += 9;
                    this.pieceDifference[PieceType.QUEEN]++;
                    f++;
                    break;
                case 'q':
                    var piece = new Queen(f, r, Color.BLACK);
                    this.board[f][r] = piece;
                    this.blackPieces.push(piece);
                    this.points -= 9;
                    this.pieceDifference[PieceType.QUEEN]--;
                    f++;
                    break;
                case 'K':
                    var piece = new King(f, r, Color.WHITE);
                    this.board[f][r] = piece;
                    this.whitePieces.push(piece);
                    this.whiteKing = piece;
                    f++;
                    break;
                case 'k':
                    var piece = new King(f, r, Color.BLACK);
                    this.board[f][r] = piece;
                    this.blackPieces.push(piece);
                    this.blackKing = piece;
                    f++;
                    break;
                case 'R':
                    var piece = new Rook(f, r, Color.WHITE);
                    this.board[f][r] = piece;
                    this.whitePieces.push(piece);
                    this.points += 5;
                    this.pieceDifference[PieceType.ROOK]++;
                    f++;
                    break;
                case 'r':
                    var piece = new Rook(f, r, Color.BLACK);
                    this.board[f][r] = piece;
                    this.blackPieces.push(piece);
                    this.points -= 5;
                    this.pieceDifference[PieceType.ROOK]--;
                    f++;
                    break;
                case 'N':
                    var piece = new Knight(f, r, Color.WHITE);
                    this.board[f][r] = piece;
                    this.whitePieces.push(piece);
                    this.points += 3;
                    this.pieceDifference[PieceType.KNIGHT]++;
                    f++;
                    break;
                case 'n':
                    var piece = new Knight(f, r, Color.BLACK);
                    this.board[f][r] = piece;
                    this.blackPieces.push(piece);
                    this.points -= 3;
                    this.pieceDifference[PieceType.KNIGHT]--;
                    f++;
                    break;
                case 'B':
                    var piece = new Bishop(f, r, Color.WHITE);
                    this.board[f][r] = piece;
                    this.whitePieces.push(piece);
                    this.points += 3;
                    this.pieceDifference[PieceType.BISHOP]++;
                    f++;
                    break;
                case 'b':
                    var piece = new Bishop(f, r, Color.BLACK);
                    this.board[f][r] = piece;
                    this.blackPieces.push(piece);
                    this.points -= 3;
                    this.pieceDifference[PieceType.BISHOP]--;
                    f++;
                    break;
                case 'P':
                    var piece = new Pawn(f, r, Color.WHITE);
                    this.board[f][r] = piece;
                    this.whitePieces.push(piece);
                    this.points += 1;
                    this.pieceDifference[PieceType.PAWN]++;
                    f++;
                    break;
                case 'p':
                    var piece = new Pawn(f, r, Color.BLACK);
                    this.board[f][r] = piece;
                    this.blackPieces.push(piece);
                    this.points -= 1;
                    this.pieceDifference[PieceType.PAWN]--;
                    f++;
                    break;
                case '/':
                    f = 0;
                    r--;
                    break;
                default:
                    var n = Number.parseInt(splitFen[0][i]);
                    for (var j = 0; j < n; j++)
                    f++;
                    break;
            }
        }

        switch (splitFen[1]) {
            case "w":
                this.toMove = Color.WHITE;
                break;
            case "b":
                this.toMove = Color.BLACK;
                break;
        }

        this.whiteCanCastleKingside = false;
        this.whiteCanCastleQueenside = false;
        this.blackCanCastleKingside = false;
        this.blackCanCastleQueenside = false;

        for (var i = 0; i < splitFen[2].length; i++) {
            switch (splitFen[2][i]) {
                case 'K':
                    this.whiteCanCastleKingside = true;
                    break;
                case 'Q':
                    this.whiteCanCastleQueenside = true;
                    break;
                case 'k':
                    this.blackCanCastleKingside = true;
                    break;
                case 'q':
                    this.blackCanCastleQueenside = true;
                    break;
            }
        }

        switch (splitFen[3]) {
            case "-":
                this.enPassantPosition = null;
                break;
            default:
                let file = splitFen[3][0].charCodeAt() - 97;
                let rank = Number.parseInt(splitFen[3][1]) - 1;
                this.enPassantPosition = { file: file, rank: rank };
                break;
        }

        this.halfMoveCount = Number.parseInt(splitFen[4]);
        this.turnCount = Number.parseInt(splitFen[5]);
        if (this.toMove == Color.WHITE) {
            if (this.whiteKing.isChecked(this)) {
                this.check = { file: this.whiteKing.file, rank: this.whiteKing.rank };
                console.log('test');
            }
        }
        else {
            if (this.blackKing.isChecked(this)) {
                this.check = { file: this.blackKing.file, rank: this.blackKing.rank };
            }
        }


    }
}