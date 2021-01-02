using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChessGame;
using ChessGameOnline.Controllers.Responses;
using ChessGameOnline.Services.Responses;
using Microsoft.AspNetCore.SignalR;

namespace ChessGameOnline.Services
{
    public class GameService
    {
        public Dictionary<string, int> PlayersGamestates;
        public Dictionary<int, MultiplayerGamestate> Gamestates;
        private int nextGameId;
        private IHubContext<GameHub> _hubContext;
        public GameService(IHubContext<GameHub> hubContext)
        {
            PlayersGamestates = new Dictionary<string, int>();
            Gamestates = new Dictionary<int, MultiplayerGamestate>();
            nextGameId = 1;
            _hubContext = hubContext;
        }

        private void RemoveGame(int gameId)
        {
            Gamestates.Remove(gameId);
            var players = PlayersGamestates.Where((pair) => pair.Value == gameId);
            foreach(var player in players)
            {
                PlayersGamestates.Remove(player.Key);
                var playerConnections = GameHub.UsersConnections[player.Key];
                foreach(var connection in playerConnections)
                {
                    _hubContext.Groups.RemoveFromGroupAsync(connection, gameId.ToString());
                }
            }
        }

        public int CreateGame(String player, int time, int increment)
        {
            var gamestate = new MultiplayerGamestate(player, String.Empty, increment, time);
            int prevGame;
            bool inGame = PlayersGamestates.TryGetValue(player, out prevGame);
            int gameId;
            if (inGame)
            {
                PlayersGamestates[player] = prevGame;
                PlayersGamestates.Remove(Gamestates[prevGame].Black);
                Gamestates[prevGame] = gamestate;
                gameId = prevGame;
            } else
            {
                Gamestates.Add(nextGameId, gamestate);
                PlayersGamestates.Add(player, nextGameId);
                gameId = nextGameId;
                nextGameId += 1;
            }
            gamestate.WhiteTimer.Elapsed += (sender, args) =>
            {
                _hubContext.Clients.Group(gameId.ToString()).SendAsync("timerElapsed", "BLACK");
                RemoveGame(gameId);
            };
            gamestate.BlackTimer.Elapsed += (sender, args) =>
            {
                _hubContext.Clients.Group(gameId.ToString()).SendAsync("timerElapsed", "WHITE");
                RemoveGame(gameId);
            };
            return PlayersGamestates[player];
        }
        
        public class JoinGameResponse
        {
            public GamestateResponse Gamestate { get; set; }
            public string Color { get; set; }
        }
        public string JoinGame(String player, int gameId)
        {
            if (Gamestates[gameId] != null)
            {
                if (Gamestates[gameId].Black == String.Empty && Gamestates[gameId].White != player)
                {
                    Gamestates[gameId].Black = player;
                    if (!PlayersGamestates.ContainsKey(player))
                        PlayersGamestates.Add(player, gameId);
                }
                if (Gamestates[gameId].GameOver)
                {
                    var gamestate = Gamestates[gameId];
                    Gamestates[gameId] = new MultiplayerGamestate(player, String.Empty, gamestate.Increment, gamestate.Time);
                }
                string color;
                if (Gamestates[gameId].White == player)
                    color = "WHITE";
                else if (Gamestates[gameId].Black == player)
                    color = "BLACK";
                else
                    color = "SPECTATE";
                return color;
            } else
            {
                return String.Empty;
            }
        }

        public MoveResponse Move(string src, string dst, String player)
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
                var currentPlayer = gamestate.ToMove;
                var moveSrc = new Position(src[0], int.Parse(src[1].ToString()));
                var moveDst = new Position(dst[0], int.Parse(dst[1].ToString()));
                var result = gamestate.Move(moveSrc, moveDst);
                if(result == MoveResult.MOVED)
                {
                    if(currentPlayer == Color.WHITE && gamestate.WhiteRemainingTime > 0)
                    {
                        gamestate.WhiteTimer.Stop();
                        gamestate.whiteStopwatch.Stop();
                        gamestate.WhiteRemainingTime -= (int)gamestate.whiteStopwatch.ElapsedMilliseconds;
                        gamestate.WhiteRemainingTime += gamestate.Increment;
                        gamestate.whiteStopwatch.Reset();

                        gamestate.blackStopwatch.Start();
                        gamestate.BlackTimer.Interval = gamestate.BlackRemainingTime;
                        gamestate.BlackTimer.Start();
                    } else if (currentPlayer == Color.BLACK && gamestate.BlackRemainingTime > 0)
                    {
                        gamestate.BlackTimer.Stop();
                        gamestate.blackStopwatch.Stop();
                        gamestate.BlackRemainingTime -= (int)gamestate.blackStopwatch.ElapsedMilliseconds;
                        gamestate.BlackRemainingTime += gamestate.Increment;
                        gamestate.blackStopwatch.Reset();

                        gamestate.whiteStopwatch.Start();
                        
                        gamestate.WhiteTimer.Interval = gamestate.WhiteRemainingTime;
                        gamestate.WhiteTimer.Start();
                    }
                }
                return new MoveResponse(result, gamestate);
            }

            return new MoveResponse(MoveResult.WRONG_COLOR, gamestate);

        }

        public async Task<MultiplayerGamestate> Update(String player)
        {
            MultiplayerGamestate gamestate;
            int gameId;
            bool gameExists = PlayersGamestates.TryGetValue(player, out gameId);
            if (!gameExists)
                return null;
            gamestate = Gamestates[gameId];
            if (gamestate.White == player)
            {
                while (!(gamestate.ToMove == Color.WHITE) || gamestate.Black == String.Empty)
                    await Task.Delay(500);
                return gamestate;
            }
            else if (gamestate.Black == player)
            {
                while (!(gamestate.ToMove == Color.BLACK) || gamestate.White == String.Empty)
                    await Task.Delay(500);
                return gamestate;
            }
            else
                return null;
        }

        public MoveResponse Promote(String player, string pieceType)
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
