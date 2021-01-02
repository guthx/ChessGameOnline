using ChessGameOnline.Controllers.Responses;
using ChessGameOnline.Services;
using ChessGameOnline.Services.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using static ChessGameOnline.Services.GameService;

namespace ChessGameOnline.Controllers
{
    [Route("api/[controller]")]
    public class GameController : Controller
    {
        private GameService _gameService;
        private TcpServer _tcpServer;
        private readonly string _jwtKey;

        public GameController(GameService gameService, TcpServer tcpServer, IConfiguration config)
        {
            _gameService = gameService;
            _tcpServer = tcpServer;
            _jwtKey = config.GetSection("JwtConfig").GetSection("jwtKey").Value;
        }

        [HttpGet("jwt")]
        public string GetJwt()
        {
            var guid = Guid.NewGuid();
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtKey);
            var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);
            /*
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            */
            var token = new JwtSecurityToken("localhost", "localhost", new[]{
                new Claim(ClaimTypes.NameIdentifier, guid.ToString())
            }, null, null, signingCredentials);
            return tokenHandler.WriteToken(token);
        }

        [HttpGet("test")]
        [Authorize]
        public string Test()
        {
            return "works";
        }
        /*
        [HttpGet("test")]
        public async Task<StatusCodeResult> Test()
        {
            await Task.Run(() => _tcpServer.Verify());
            return StatusCode(200);
        }

        [HttpPost("newgame")]
        public ActionResult<int> CreateGame([FromBody] string userId)
        {
            try
            {
                var guid = Guid.Parse(userId);
                var result = _gameService.CreateGame(guid);
                return result;
            } catch (Exception ex) 
            {
                return StatusCode(500);
            }
        }

        public class JoinGameRequest
        {
            public string userId { get; set; }
            public int gameId { get; set; }
        }
        [HttpPost("joingame")]
        public ActionResult<JoinGameResponse> JoinGame([FromBody] JoinGameRequest request)
        {
            try
            {
                var guid = Guid.Parse(request.userId);
                var result = _gameService.JoinGame(guid, request.gameId);
                return result;
            } catch (Exception ex)
            {
                return StatusCode(500);
            }
        }
        [HttpGet("game")]
        public async Task<ActionResult<GamestateResponse>> Update(string userId)
        {
            try
            {
                var guid = Guid.Parse(userId);
                var result = await _gameService.Update(guid);
                return new GamestateResponse(result);
            } catch (Exception ex)
            {
                return StatusCode(500);
            }
        }

        public class MoveRequest
        {
            public string userId { get; set; }
            public string src { get; set; }
            public string dst { get; set; }
        }
        [HttpPost("move")]
        public ActionResult<MoveResponse> Move([FromBody] MoveRequest request)
        {
            try
            {
                var guid = Guid.Parse(request.userId);
                var result = _gameService.Move(request.src, request.dst, guid);
                return result;
            } catch (Exception ex)
            {
                return StatusCode(500);
            }
        }

        public class PromoteRequest
        {
            public string userId { get; set; }
            public string pieceType { get; set; }
        }

        [HttpPost("promote")]
        public ActionResult<MoveResponse> Promote([FromBody] PromoteRequest request)
        {
            try
            {
                var guid = Guid.Parse(request.userId);
                var result = _gameService.Promote(guid, request.pieceType);
                return result;
            } catch (Exception ex)
            {
                return StatusCode(500);
            }
        }
        */
    }
}
