using ChessGame;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChessGameOnline.Models
{
    public class PieceMoves
    {
        public Position Position;
        public List<Position> Moves;

        public PieceMoves(Position position, List<Position> moves)
        {
            Position = position;
            Moves = moves;
        }
    }
}
