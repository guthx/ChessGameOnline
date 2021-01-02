using ChessGame;
using ChessGameOnline.Services;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Controllers.Responses
{
    public class PieceResponse
    {
       
        public string Type { get; set; }
     
        public string Color { get; set; }
      
        public List<Position> ValidMoves { get; set; }

        public PieceResponse(Piece piece)
        {
            Type = piece.GetType().Name;
            Color = piece.Color.ToString();
            ValidMoves = piece.ValidMoves;
        }
    }
    public class GamestateResponse
    {
     
        public PieceResponse[,] Board { get; set; }
    
        public string ToMove { get; set; }
   
        public int TurnCount {get;set;}
  
        public bool GameOver { get; set; }
        
        public int WhiteTime { get; set; }
        public int BlackTime { get; set; }

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
            WhiteTime = gamestate.WhiteRemainingTime;
            BlackTime = gamestate.BlackRemainingTime;
        }
    }
}
