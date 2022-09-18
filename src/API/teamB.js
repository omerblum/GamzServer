const express = require("express");
const router = express.Router();

function getTeamB(teamA) 
{
  console.log("getTeamB: started with competition = " + teamA)
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
    // console.log(get("sport"));
    const comp = getTeamB("Brazil");
    console.log(comp)
    res.json(comp);
});

module.exports = router;