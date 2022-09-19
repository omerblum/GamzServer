const express = require("express");
const router = express.Router();

function getTeamA(competition) 
{
  switch(competition) 
  {
      case 'FIFA':
          return ['Brazil', 'Argentina'];
      case 'UEFA':
          return ['France', 'Israel']
      case 'Heineken Cup':
        return ['New Ziland', 'Australia']
      default:
          return [];
  }
}

router.get("/", (req, res) => 
{
    const competition = req.query.competition;
    res.json(getTeamA(competition));
});

module.exports = router;