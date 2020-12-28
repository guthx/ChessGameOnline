using ChessGameOnline.Controllers.Responses;
using ChessGameOnline.Services;
using ChessGameOnline.Services.Responses;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ChessGameOnline.Services.GameService;

namespace ChessGameOnline.Controllers
{
    [Route("api/[controller]")]
    public class GameController : Controller
    {
        private GameService _gameService;

        public GameController(GameService gameService)
        {
            _gameService = gameService;
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
    }
}
