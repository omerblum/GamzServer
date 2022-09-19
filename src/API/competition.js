const express = require("express");
const router = express.Router();

function getCompetition(sport)
{
    switch(sport) {
        case 'Football':
            return ['FIFA', 'UEFA'];
        case 'Rugby':
            return ['International Tests', 'Heineken Cup']
        case 'Basketball':
          return ['NBA', 'Euroleague']
        default:
            return [];
    }
} 

router.get("/", (req, res) => 
{
    const sport = req.query.sport;
    res.json(getCompetition(sport));
});

module.exports = router;