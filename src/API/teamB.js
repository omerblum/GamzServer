const express = require("express");
const router = express.Router();

function getTeamB(teamA) 
{
  switch(teamA) 
  {
      case 'Brazil':
          return ['England', 'Urugway'];
      case 'Argentina':
          return ['Belgium', 'Portugal']
      case 'France':
        return ['Egypt', 'Norway']
      default:
          return [];
  }
}

router.get("/", (req, res) => 
{
    const teamA = req.query.teamA;   
    res.json(getTeamB(teamA));
});

module.exports = router;