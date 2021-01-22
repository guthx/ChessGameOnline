using ChessGame;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Models
{
    public class Move
    {
        public Position From;
        public Position To;
        public Move(Position from, Position to)
        {
            From = from;
            To = to;
        }
    }
}
