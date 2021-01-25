using ChessGameOnline.Controllers.Responses;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Threading.Tasks;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Timers;
using ChessGame;
using ChessGameOnline.Services.Responses;

namespace ChessGameOnline.Services
{
    [Authorize]
    public class GameHub : Hub
    {
        private static GameService _gameService;
        public static Dictionary<string, List<string>> UsersConnections = new Dictionary<string, List<string>>();

        public GameHub(GameService gameService) : base()
        {
            _gameService = gameService;
        }

        public override Task OnConnectedAsync()
        {
            if (!UsersConnections.ContainsKey(Context.UserIdentifier))
                UsersConnections.Add(Context.UserIdentifier, new List<string>());
            UsersConnections[Context.UserIdentifier].Add(Context.ConnectionId);
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId) &&
                !_gameService.Gamestates[gameId].GameOver)
            {
                Clients.Caller.SendAsync("reconnect", gameId);
            }
            return base.OnConnectedAsync();
        }

        

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            UsersConnections[userId].Remove(Context.ConnectionId);
            if (UsersConnections[userId].Count == 0)
                _gameService.SetGameRemovalTimer(userId);
            
            return base.OnDisconnectedAsync(exception);
        }


        public async Task SendConnectionId(string connectionId)
        {
            string name = Context.User.Identity.Name;
            await Clients.All.SendAsync("setClientMessage", "A connection with ID '" + connectionId + "' has just connected");
            
        }

        public async Task<int> CreateGame(int time, int increment)
        {
            int gameId = _gameService.CreateGame(Context.UserIdentifier, time, increment);
            
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
            return gameId;
        }

        public async Task<string> JoinGame(int gameId)
        {
            string color = _gameService.JoinGame(Context.UserIdentifier, gameId);
            if (color != String.Empty)
            {
                if (color == "WHITE" || color == "BLACK")
                {
                    _gameService.StopGameRemovalTimer(Context.UserIdentifier);
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
                    await Clients.OthersInGroup(gameId.ToString()).SendAsync("opponentReady");
                }
                else if (color == "SPECTATE")
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString() + "_spectate");
                }
                return color;
            }
            return null;
            
        }

        public async Task Update()
        {
            int gameId = _gameService.PlayersGamestates[Context.UserIdentifier];
            var gamestate = _gameService.Gamestates[gameId];
            await Clients.Caller.SendAsync("setGameState", new GamestateResponse(gamestate));
        }


        public async Task Move(string src, string dst)
        {
            var result = _gameService.Move(src, dst, Context.UserIdentifier);
            if(result != null)
            {
                if (result.MoveResult == "MOVED" || result.MoveResult == "GAME_OVER")
                {

                    await Clients.Group(_gameService.PlayersGamestates[Context.UserIdentifier].ToString()).SendAsync("updateGameState", result.Gamestate);
                    await Clients.Group(_gameService.PlayersGamestates[Context.UserIdentifier].ToString() + "_spectate").SendAsync("updateGameState", result.Gamestate);
                } else if (result.MoveResult == "AWAITING_PROMOTION")
                {
                    await Clients.Caller.SendAsync("awaitingPromotion", dst);
                }
                _gameService.Gamestates[_gameService.PlayersGamestates[Context.UserIdentifier]].TurnBackRequest = -1;
                await Clients.OthersInGroup(_gameService.PlayersGamestates[Context.UserIdentifier].ToString()).SendAsync("takebackRejected");
            }
        }

        public async Task Promote(PieceType type)
        {
            var result = _gameService.Promote(Context.UserIdentifier, type);
            if(result != null)
            {
                if (result.MoveResult == "MOVED" || result.MoveResult == "GAME_OVER")
                {

                    await Clients.Group(_gameService.PlayersGamestates[Context.UserIdentifier].ToString()).SendAsync("updateGameState", result.Gamestate);
                }
            }
        }

        public async Task SearchGame(int time, int increment)
        {
            var timeControl = new TimeControl
            {
                Time = time,
                Increment = increment
            };
            string player1;
            if (!_gameService.PlayerSearchingGame.TryGetValue(timeControl, out player1))
                _gameService.PlayerSearchingGame.Add(timeControl, Context.UserIdentifier);
            else if (player1 == Context.UserIdentifier) { }
            else
            {
                _gameService.PlayerSearchingGame.Remove(timeControl);
                var player2 = Context.UserIdentifier;
                var coinToss = new Random().Next(0, 2);
                int gameId;
                if (coinToss == 0)
                {
                    gameId = _gameService.CreateGame(player1, time, increment);
                    _gameService.Gamestates[gameId].Black = player2;
                } else
                {
                    gameId = _gameService.CreateGame(player2, time, increment);
                    _gameService.Gamestates[gameId].Black = player1;
                }
               //_gameService.PlayersGamestates.Add(player1, gameId);
               // _gameService.PlayersGamestates.Add(player2, gameId);
                foreach (var connection in UsersConnections[player1])
                {
                    await Groups.AddToGroupAsync(connection, gameId.ToString());
                }
                foreach (var connection in UsersConnections[player2])
                {
                    await Groups.AddToGroupAsync(connection, gameId.ToString());
                }
                await Clients.Group(gameId.ToString()).SendAsync("gameFound", gameId);
            }
            
        }

        public async Task ProposeDraw()
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                if (gamestate.White == Context.UserIdentifier)
                    gamestate.DrawProposed = "WHITE";
                else if (gamestate.Black == Context.UserIdentifier)
                    gamestate.DrawProposed = "BLACK";
                gamestate.DrawTimer.Start();
                await Clients.OthersInGroup(gameId.ToString()).SendAsync("drawProposed");
            }
        }

        public async Task RespondDraw(bool response)
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                if (gamestate.White == Context.UserIdentifier && gamestate.DrawProposed == "BLACK" ||
                    gamestate.Black == Context.UserIdentifier && gamestate.DrawProposed == "WHITE")
                {
                    gamestate.DrawTimer.Stop();
                    gamestate.DrawProposed = String.Empty;
                    if (response == false)
                    {
                        await Clients.Group(gameId.ToString()).SendAsync("drawRejected");
                    } else
                    {
                        gamestate.GameOver = true;
                        gamestate.GameResult = GameResult.DRAW;
                        await Clients.Group(gameId.ToString()).SendAsync("updateGameState", new UpdateGamestateResponse(gamestate));
                    }
                }
            }
        }

        public async Task Resign()
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                if (gamestate.White == Context.UserIdentifier)
                {
                    gamestate.BlackTimer.Stop();
                    gamestate.WhiteTimer.Stop();
                    gamestate.GameOver = true;
                    gamestate.GameResult = GameResult.BLACK_WIN;
                    await Clients.Group(gameId.ToString()).SendAsync("updateGameState", new UpdateGamestateResponse(gamestate));
                }
                else if (gamestate.Black == Context.UserIdentifier)
                {
                    gamestate.BlackTimer.Stop();
                    gamestate.WhiteTimer.Stop();
                    gamestate.GameOver = true;
                    gamestate.GameResult = GameResult.WHITE_WIN;
                    await Clients.Group(gameId.ToString()).SendAsync("updateGameState", new UpdateGamestateResponse(gamestate));
                }
            }
        }

        public async Task RequestTakeback()
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                if (gamestate.White == Context.UserIdentifier && gamestate.ToMove == Color.BLACK)
                {
                    gamestate.TurnBackRequest = gamestate.TurnCount * 2 - 2;
                    await Clients.OthersInGroup(gameId.ToString()).SendAsync("takebackRequested");
                }
                else if (gamestate.Black == Context.UserIdentifier && gamestate.ToMove == Color.WHITE)
                {
                    gamestate.TurnBackRequest = gamestate.TurnCount * 2 - 3;
                    await Clients.OthersInGroup(gameId.ToString()).SendAsync("takebackRequested");
                }
            }
        }

        public async Task RespondTakeback(bool response)
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                if (response)
                {
                    if (gamestate.White == Context.UserIdentifier &&
                        gamestate.ToMove == Color.WHITE &&
                        gamestate.TurnBackRequest >= 0 &&
                        gamestate.TurnBackRequest % 2 == 1)
                    {
                        gamestate = new MultiplayerGamestate(gamestate.PositionHistory[gamestate.TurnBackRequest], gamestate);
                        gamestate.BlackTimer.Interval = gamestate.BlackRemainingTime;
                        gamestate.BlackStopwatch.Restart();
                        gamestate.BlackTimer.Start();
                        _gameService.Gamestates[gameId] = gamestate;
                        await Clients.Group(gameId.ToString()).SendAsync("setGameState", new GamestateResponse(gamestate));
                    }
                    else if (gamestate.Black == Context.UserIdentifier &&
                        gamestate.ToMove == Color.BLACK &&
                        gamestate.TurnBackRequest >= 0 &&
                        gamestate.TurnBackRequest % 2 == 0)
                    {
                        gamestate = new MultiplayerGamestate(gamestate.PositionHistory[gamestate.TurnBackRequest], gamestate);
                        gamestate.WhiteStopwatch.Restart();
                        gamestate.WhiteTimer.Start();
                        _gameService.Gamestates[gameId] = gamestate;
                        await Clients.Group(gameId.ToString()).SendAsync("setGameState", new GamestateResponse(gamestate));
                    }
                }
                else
                {
                    await Clients.OthersInGroup(gameId.ToString()).SendAsync("takebackRejected");
                }
            }
        }

        public async Task RespondRematch(bool response)
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                
                if (response)
                {
                    if (!gamestate.Rematch)
                    {
                        gamestate.Rematch = true;
                        await Clients.OthersInGroup(gameId.ToString()).SendAsync("rematchAccepted");
                    } else
                    {
                        if (_gameService.Rematch(gameId))
                            await Clients.Group(gameId.ToString()).SendAsync("rematch");
                        else
                            await Clients.Group(gameId.ToString()).SendAsync("rematchDeclined");
                    }
                }
                else
                {
                    gamestate.Rematch = false;
                    await Clients.OthersInGroup(gameId.ToString()).SendAsync("rematchDeclined");
                }
            }
        }

        public Piece[,] GetPreviousPosition(int positionNumber)
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                var gamestate = _gameService.Gamestates[gameId];
                var previousPosition = Gamestate.GetBoardFromFen(gamestate.PositionHistory[positionNumber]);
                return previousPosition;
            }
            return null;
        }

        public async Task SendChatMessage(string message)
        {
            int gameId;
            if (_gameService.PlayersGamestates.TryGetValue(Context.UserIdentifier, out gameId))
            {
                string player = _gameService.Gamestates[gameId].White == Context.UserIdentifier ? "White" : "Black";
                await Clients.Group(gameId.ToString()).SendAsync("chatMessage", player, message);
            }
        }
    }
}
