using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using ChessGame;
using ChessGameOnline.Controllers.Responses;
using ChessGameOnline.Services.Responses;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace ChessGameOnline.Services
{
    public class TimeControl
    {
        public int Time { get; set; }
        public int Increment { get; set; }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                TimeControl t = (TimeControl)obj;
                return (Time == t.Time) && (Increment == t.Increment);
            }
        }
        public override int GetHashCode()
        {
            return (Time << 2) ^ Increment;
        }
    }
    public class GameService
    {
        public Dictionary<string, int> PlayersGamestates;
        public Dictionary<int, MultiplayerGamestate> Gamestates;
        public Dictionary<TimeControl, string> PlayerSearchingGame;
        private int nextGameId;
        private IHubContext<GameHub> _hubContext;
        public GameService(IHubContext<GameHub> hubContext)
        {
            PlayersGamestates = new Dictionary<string, int>();
            Gamestates = new Dictionary<int, MultiplayerGamestate>();
            nextGameId = 1;
            _hubContext = hubContext;
            PlayerSearchingGame = new Dictionary<TimeControl, string>();
        }

        public async void RemoveGame(int gameId)
        {
            await Task.Delay(10000);
            Gamestates.Remove(gameId);
            var players = PlayersGamestates.Where((pair) => pair.Value == gameId);
            foreach(var player in players)
            {
                PlayersGamestates.Remove(player.Key);
                var playerConnections = GameHub.UsersConnections[player.Key];
                foreach(var connection in playerConnections)
                {
                    await _hubContext.Groups.RemoveFromGroupAsync(connection, gameId.ToString());
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
             //   PlayersGamestates[player] = prevGame;
              //  PlayersGamestates.Remove(Gamestates[prevGame].Black);
                Gamestates[prevGame] = gamestate;
                gameId = prevGame;
            } else
            {
                Gamestates.Add(nextGameId, gamestate);
              //  PlayersGamestates.Add(player, nextGameId);
                gameId = nextGameId;
                nextGameId += 1;
            }
            gamestate.WhiteTimer.Elapsed += (sender, args) =>
            {
                gamestate.GameOver = true;
                gamestate.GameResult = GameResult.BLACK_WIN;
                DefaultContractResolver contractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy()
                };
                JsonSerializerSettings settings = new JsonSerializerSettings
                {
                    ContractResolver = contractResolver,
                    Formatting = Formatting.Indented
                };
                var response = new GamestateResponse(gamestate);
                var json = JsonConvert.SerializeObject(response, settings);
                _hubContext.Clients.Group(gameId.ToString()).SendAsync("updateGameState", json);
                RemoveGame(gameId);
            };
            gamestate.BlackTimer.Elapsed += (sender, args) =>
            {
                gamestate.GameOver = true;
                gamestate.GameResult = GameResult.WHITE_WIN;
                DefaultContractResolver contractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy()
                };
                JsonSerializerSettings settings = new JsonSerializerSettings
                {
                    ContractResolver = contractResolver,
                    Formatting = Formatting.Indented
                };
                var response = new GamestateResponse(gamestate);
                var json = JsonConvert.SerializeObject(response, settings);
                _hubContext.Clients.Group(gameId.ToString()).SendAsync("updateGameState", json);
                RemoveGame(gameId);
            };
            gamestate.DrawTimer.Elapsed += (arg, e) =>
            {
                gamestate.DrawProposed = String.Empty;
                _hubContext.Clients.Group(gameId.ToString()).SendAsync("drawRejected");
            };
           
            return gameId;
        }
        
        public class JoinGameResponse
        {
            public GamestateResponse Gamestate { get; set; }
            public string Color { get; set; }
        }
        /*
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
        */
        public string JoinGame(String player, int gameId)
        {
            MultiplayerGamestate gamestate;
            if (Gamestates.TryGetValue(gameId, out gamestate))
            {
                if (gamestate.White == player)
                {
                    PlayersGamestates[player] = gameId;
                    return "WHITE";
                } else if (gamestate.Black == player)
                {
                    PlayersGamestates[player] = gameId;
                    return "BLACK";
                } else if (gamestate.White == String.Empty)
                {
                    gamestate.White = player;
                    PlayersGamestates[player] = gameId;
                    return "WHITE";
                } else if (gamestate.Black == String.Empty)
                {
                    gamestate.Black = player;
                    PlayersGamestates[player] = gameId;
                    return "BLACK";
                } else
                {
                    return "SPECTATE";
                }
            } 
            else
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
                if(result == MoveResult.GAME_OVER)
                {
                    
                    RemoveGame(gameId);
                }
                if(result == MoveResult.MOVED)
                {
                    if(currentPlayer == Color.WHITE && gamestate.WhiteRemainingTime > 0)
                    {
                        gamestate.WhiteTimer.Stop();
                        gamestate.WhiteRemainingTime -= (int)gamestate.WhiteStopwatch.ElapsedMilliseconds;
                        gamestate.WhiteRemainingTime += gamestate.Increment;

                        gamestate.BlackTimer.Interval = gamestate.BlackRemainingTime;
                        gamestate.BlackTimer.Start();
                    } else if (currentPlayer == Color.BLACK && gamestate.BlackRemainingTime > 0)
                    {
                        gamestate.BlackTimer.Stop();
                        gamestate.BlackRemainingTime -= (int)gamestate.BlackStopwatch.ElapsedMilliseconds;
                        gamestate.BlackRemainingTime += gamestate.Increment;
                        
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

        public MoveResponse Promote(String player, PieceType pieceType)
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
                var result = gamestate.Promote(pieceType);
                return new MoveResponse(result, gamestate);
            }

            return new MoveResponse(MoveResult.WRONG_COLOR, gamestate);
        }
    }
}
