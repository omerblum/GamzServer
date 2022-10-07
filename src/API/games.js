const express = require("express");
const router = express.Router();

const games = [ {
    "game_id": 1003,      
    "team_a": "Hapoel TLV",
    "team_b": "Macabi TLV",        
    "competition": "Israel premier league",
    "game_date": "2022-06-17",
    "game_time": "20:00",
    "sport": "Football"
    },
  
  {
    "game_id": 28,
    "team_a": "Manchester UTD",
    "team_b": "Manchester City",
    "competition": "English premier league",
    "game_date": "2022-06-17",
    "game_time": "20:00",
    "sport": "Football"
  },
  {
    "game_id": 19,   
    "team_a": "Barcelona",
    "team_b": "Real Madrid",
    "competition": "EPL",
    "game_date": "2022-06-17",
    "game_time": "20:00",
    "sport": "Football"
  }];

router.get("/", (req, res) => 
{
    res.json(games);
});

module.exports = router;