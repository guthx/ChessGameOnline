using ChessGame;
using ChessGameOnline.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Services.Responses
{
    public class UpdateGamestateResponse
    {
        public string Fen;
        public (Position, Position) LastMove;
        public int WhiteTime;
        public int BlackTime;
        public string GameResult;
        public string MoveNotation;

        public UpdateGamestateResponse(MultiplayerGamestate gamestate, bool promoted = false)
        {
            Fen = gamestate.PositionHistory.Last();
            if (gamestate.LastMoves.Count > 0)
                LastMove = gamestate.LastMoves[0];
            WhiteTime = gamestate.WhiteRemainingTime;
            BlackTime = gamestate.BlackRemainingTime;
            if (gamestate.GameResult != ChessGame.GameResult.ACTIVE)
                GameResult = gamestate.GameResult.ToString();
            else
                GameResult = null;
            MoveNotation = gamestate.MoveHistory.Last();
        }
    }
}
