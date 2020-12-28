using ChessGame;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Services
{
    public class MultiplayerGamestate : Gamestate
    {
        public Guid White;
        public Guid Black;
        

        public MultiplayerGamestate(Guid white, Guid black) : base()
        {
            White = white;
            Black = black;
        }
    }
}
