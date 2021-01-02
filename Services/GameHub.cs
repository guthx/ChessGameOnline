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

namespace ChessGameOnline.Services
{
    [Authorize]
    public class GameHub : Hub
    {
        private GameService _gameService;
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
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            UsersConnections[Context.UserIdentifier].Remove(Context.ConnectionId);
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
            var response = new GamestateResponse(gamestate);
            var contractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            };
            
            var json = JsonConvert.SerializeObject(response, new JsonSerializerSettings
            {
                ContractResolver = contractResolver,
                Formatting = Formatting.Indented
            });
            await Clients.Caller.SendAsync("updateGameState", json);
        }

        public async Task Move(string src, string dst)
        {
            var result = _gameService.Move(src, dst, Context.UserIdentifier);
            if(result != null)
            {
                if (result.MoveResult == "MOVED" || result.MoveResult == "CHECKMATE")
                {
                    var contractResolver = new DefaultContractResolver
                    {
                        NamingStrategy = new CamelCaseNamingStrategy()
                    };

                    var json = JsonConvert.SerializeObject(result.Gamestate, new JsonSerializerSettings
                    {
                        ContractResolver = contractResolver,
                        Formatting = Formatting.Indented
                    });

                    await Clients.Group(_gameService.PlayersGamestates[Context.UserIdentifier].ToString()).SendAsync("updateGameState", json);
                } else if (result.MoveResult == "AWAITING_PROMOTION")
                {
                    await Clients.Caller.SendAsync("awaitingPromotion", dst);
                }
            }
        }

        public async Task Promote(string type)
        {
            var result = _gameService.Promote(Context.UserIdentifier, type);
            if(result != null)
            {
                if (result.MoveResult == "MOVED" || result.MoveResult == "CHECKMATE")
                {
                    var contractResolver = new DefaultContractResolver
                    {
                        NamingStrategy = new CamelCaseNamingStrategy()
                    };

                    var json = JsonConvert.SerializeObject(result.Gamestate, new JsonSerializerSettings
                    {
                        ContractResolver = contractResolver,
                        Formatting = Formatting.Indented
                    });

                    await Clients.Group(_gameService.PlayersGamestates[Context.UserIdentifier].ToString()).SendAsync("updateGameState", json);
                }
            }
        }

      
    }
}
