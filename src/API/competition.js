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
    // console.log(get("sport"));
    const comp = getCompetition("Rugby");
    console.log(comp)
    res.json(comp);
});

module.exports = router;