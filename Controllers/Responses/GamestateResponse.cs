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
     
        public Piece[,] Board { get; set; }
    
        public Color ToMove { get; set; }
   
        public int TurnCount {get;set;}
  
        public bool GameOver { get; set; }
        
        public int WhiteTime { get; set; }
        public int BlackTime { get; set; }
        public (Position, Position) LastMove { get; set; }
        public string GameResult { get; set; }

        public GamestateResponse(MultiplayerGamestate gamestate)
        {
            Board = gamestate.Board;
            ToMove = gamestate.ToMove;
            TurnCount = gamestate.TurnCount;
            GameOver = gamestate.GameOver;
            WhiteTime = gamestate.WhiteRemainingTime;
            BlackTime = gamestate.BlackRemainingTime;
            LastMove = gamestate.LastMove;
            GameResult = gamestate.GameResult.ToString();
        }
    }
}
