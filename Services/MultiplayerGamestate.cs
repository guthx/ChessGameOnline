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
        public Stopwatch whiteStopwatch;
        public Stopwatch blackStopwatch;
        public Timer WhiteTimer;
        public Timer BlackTimer;
        public int Time;

        public MultiplayerGamestate(string white, string black, int increment, int time) : base()
        {
            White = white;
            Black = black;
            WhiteRemainingTime = time;
            BlackRemainingTime = time;
            whiteStopwatch = new Stopwatch();
            blackStopwatch = new Stopwatch();
            WhiteTimer = new Timer(time);
            BlackTimer = new Timer(time);
            Time = time;
            Increment = increment;
        }
    }
}
