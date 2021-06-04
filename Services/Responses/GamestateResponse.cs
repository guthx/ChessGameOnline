using ChessGame;
using ChessGameOnline.Models;
using ChessGameOnline.Services;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Controllers.Responses
{
    public class GamestateResponse
    {
        public string Fen;
        public int WhiteTime;
        public int BlackTime;
        public (Position, Position) LastMove;
        public string GameResult;
        public List<string> MoveHistory;
        public List<string> PositionHistory;
        public string AwaitingPromotion;

        public GamestateResponse(MultiplayerGamestate gamestate)
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
            MoveHistory = gamestate.MoveHistory;
            PositionHistory = gamestate.PositionHistory;
            if (gamestate.awaitingPromotion != null)
                AwaitingPromotion = gamestate.awaitingPromotion.ToString();
        }
    }
}
