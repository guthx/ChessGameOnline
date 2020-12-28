using ChessGame;
using ChessGameOnline.Controllers.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Services.Responses
{
    public class MoveResponse
    {
        public string MoveResult { get; }
        public GamestateResponse Gamestate { get; }

        public MoveResponse(MoveResult moveResult, MultiplayerGamestate gamestate)
        {
            MoveResult = moveResult.ToString();
            Gamestate = new GamestateResponse(gamestate);
        }
    }
}
