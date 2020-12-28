using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChessGame;
using ChessGameOnline.Controllers.Responses;
using ChessGameOnline.Services.Responses;

namespace ChessGameOnline.Services
{
    public class GameService
    {
        public Dictionary<Guid, int> PlayersGamestates;
        public Dictionary<int, MultiplayerGamestate> Gamestates;
        private int nextGameId;
        public GameService()
        {
            PlayersGamestates = new Dictionary<Guid, int>();
            Gamestates = new Dictionary<int, MultiplayerGamestate>();
            nextGameId = 1;
        }

        public int CreateGame(Guid player)
        {
            var gamestate = new MultiplayerGamestate(player, Guid.Empty);
            int prevGame;
            bool inGame = PlayersGamestates.TryGetValue(player, out prevGame);
            if (inGame)
            {
                PlayersGamestates[player] = prevGame;
                PlayersGamestates.Remove(Gamestates[prevGame].Black);
                Gamestates[prevGame] = gamestate;
            } else
            {
                Gamestates.Add(nextGameId, gamestate);
                PlayersGamestates.Add(player, nextGameId);
                nextGameId += 1;
            }

            return PlayersGamestates[player];
        }
        
        public class JoinGameResponse
        {
            public GamestateResponse Gamestate { get; set; }
            public string Color { get; set; }
        }
        public JoinGameResponse JoinGame(Guid player, int gameId)
        {
            if (Gamestates[gameId] != null)
            {
                if (Gamestates[gameId].Black == Guid.Empty && Gamestates[gameId].White != player)
                {
                    Gamestates[gameId].Black = player;
                    if (!PlayersGamestates.ContainsKey(player))
                        PlayersGamestates.Add(player, gameId);
                }
                if (Gamestates[gameId].GameOver)
                {
                    var gamestate = Gamestates[gameId];
                    Gamestates[gameId] = new MultiplayerGamestate(player, Guid.Empty);
                }
                string color;
                if (Gamestates[gameId].White == player)
                    color = "WHITE";
                else if (Gamestates[gameId].Black == player)
                    color = "BLACK";
                else
                    color = "SPECTATE";
                return new JoinGameResponse 
                {
                    Gamestate = new GamestateResponse(Gamestates[gameId]),
                    Color = color
                };
            } else
            {
                return null;
            }
        }

        public MoveResponse Move(string src, string dst, Guid player)
        {
            MultiplayerGamestate gamestate;
            int gameId;
            bool gameExists = PlayersGamestates.TryGetValue(player, out gameId);
            if (!gameExists)
                return null;
            gamestate = Gamestates[gameId];
            if ((gamestate.White == player && gamestate.ToMove == Color.WHITE) ||
                (gamestate.Black == player && gamestate.ToMove == Color.BLACK))
            {
                var moveSrc = new Position(src[0], int.Parse(src[1].ToString()));
                var moveDst = new Position(dst[0], int.Parse(dst[1].ToString()));
                var result = gamestate.Move(moveSrc, moveDst);
                return new MoveResponse(result, gamestate);
            }

            return new MoveResponse(MoveResult.WRONG_COLOR, gamestate);

        }

        public async Task<MultiplayerGamestate> Update(Guid player)
        {
            MultiplayerGamestate gamestate;
            int gameId;
            bool gameExists = PlayersGamestates.TryGetValue(player, out gameId);
            if (!gameExists)
                return null;
            gamestate = Gamestates[gameId];
            if (gamestate.White == player)
            {
                while (!(gamestate.ToMove == Color.WHITE) || gamestate.Black == Guid.Empty)
                    await Task.Delay(500);
                return gamestate;
            }
            else if (gamestate.Black == player)
            {
                while (!(gamestate.ToMove == Color.BLACK) || gamestate.White == Guid.Empty)
                    await Task.Delay(500);
                return gamestate;
            }
            else
                return null;
        }

        public MoveResponse Promote(Guid player, string pieceType)
        {
            MultiplayerGamestate gamestate;
            int gameId;
            bool gameExists = PlayersGamestates.TryGetValue(player, out gameId);
            if (!gameExists)
                return null;
            gamestate = Gamestates[gameId];
            if ((gamestate.White == player && gamestate.ToMove == Color.WHITE) ||
                (gamestate.Black == player && gamestate.ToMove == Color.BLACK))
            {
                PieceType type;
                switch (pieceType)
                {
                    case "Queen":
                        type = PieceType.QUEEN;
                        break;
                    case "Rook":
                        type = PieceType.ROOK;
                        break;
                    case "Knight":
                        type = PieceType.KNIGHT;
                        break;
                    case "Bishop":
                        type = PieceType.BISHOP;
                        break;
                    default:
                        type = PieceType.QUEEN;
                        break;
                }
                var result = gamestate.Promote(type);
                return new MoveResponse(result, gamestate);
            }

            return new MoveResponse(MoveResult.WRONG_COLOR, gamestate);
        }
    }
}
