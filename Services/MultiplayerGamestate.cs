using ChessGame;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;

namespace ChessGameOnline.Services
{
    public class MultiplayerGamestate : Gamestate
    {
        public string White;
        public string Black;
        public int Increment;
        public int WhiteRemainingTime;
        public int BlackRemainingTime;
        public Timer WhiteTimer;
        public Timer BlackTimer;
        public int Time;
        public string DrawProposed;
        public Timer DrawTimer;
        public int TurnBackRequest;
        public bool Rematch;

        public MultiplayerGamestate(string white, string black, int increment, int time) : base()
        {
            White = white;
            Black = black;
            WhiteRemainingTime = time;
            BlackRemainingTime = time;
            WhiteTimer = new Timer(time);
            BlackTimer = new Timer(time);
            Time = time;
            Increment = increment;
            DrawProposed = String.Empty;
            DrawTimer = new Timer(15000);
            TurnBackRequest = -1;
            WhiteTimer.AutoReset = false;
            BlackTimer.AutoReset = false;
            DrawTimer.AutoReset = false;
            Rematch = false;
        }

        public MultiplayerGamestate(string fen, MultiplayerGamestate gamestate) : base(fen, gamestate)
        {
            White = gamestate.White;
            Black = gamestate.Black;
            WhiteRemainingTime = gamestate.WhiteRemainingTime;
            BlackRemainingTime = gamestate.BlackRemainingTime;
            WhiteTimer = gamestate.WhiteTimer;
            BlackTimer = gamestate.BlackTimer;
            WhiteTimer.Stop();
            BlackTimer.Stop();
            Time = gamestate.Time;
            Increment = gamestate.Increment;
            DrawProposed = String.Empty;
            DrawTimer = gamestate.DrawTimer;
            TurnBackRequest = -1;
        }
    }
}
