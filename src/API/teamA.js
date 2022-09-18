const express = require("express");
const router = express.Router();

function getTeamA(competition) 
{
  console.log("getTeamA: started with competition = " + competition)
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
    const comp = getTeamA("FIFA");
    console.log(comp)
    res.json(comp);
});

module.exports = router;