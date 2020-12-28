using ChessGame;
using ChessGameOnline.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Controllers.Responses
{
    public class PieceResponse
    {
        public string Type;
        public string Color;
        public List<Position> ValidMoves;

        public PieceResponse(Piece piece)
        {
            Type = piece.GetType().Name;
            Color = piece.Color.ToString();
            ValidMoves = piece.ValidMoves;
        }
    }
    public class GamestateResponse
    {
        public PieceResponse[,] Board;
        public string ToMove;
        public int TurnCount;
        public bool GameOver;

        public GamestateResponse(MultiplayerGamestate gamestate)
        {
            Board = new PieceResponse[8, 8];
            for (int i = 0; i < 8; i++)
                for (int j = 0; j < 8; j++)
                    if(gamestate.Board[i, j] != null)
                        Board[i, j] = new PieceResponse(gamestate.Board[i, j]);

            ToMove = gamestate.ToMove.ToString();
            TurnCount = gamestate.TurnCount;
            GameOver = gamestate.GameOver;
        }
    }
}
