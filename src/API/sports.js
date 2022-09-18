const express = require("express");
const router = express.Router();

const sports = [ 'Football', 'Rugby', 'Basketball'];

router.get("/", (req, res) => 
{
    console.log(sports)
    res.json(sports);
});

module.exports = router;