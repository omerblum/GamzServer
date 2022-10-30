const express = require("express");
const router = express.Router();
const gamesDB = require('../Database/gamesDB');

// Get all games occur today
router.get("/", async (req, res) => 
{
  var allGamesToday = await gamesDB.GetRelevantGames();

  res.send(allGamesToday) 
});

module.exports = router;