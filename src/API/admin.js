const express = require("express");
const router = express.Router();
const usersDB = require('../Database/usersDB');
const placesDB = require('../Database/placesDB');
const eventsDB = require('../Database/eventsDB');
const usersAPI = require('./users');

// Get number of places
router.get("/getNumberOfPlaces", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    console.log("user isn't admin")
    res.status(403)

    return res.send("User is unauthorized")
  }

  
  const numberOfPlaces = await placesDB.GetNumberOfPlaces(); 
  console.log("returning places ", numberOfPlaces)

  return res.json(numberOfPlaces)  
});




// Get number of users
router.get("/getNumberOfEvents", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    console.log("user isn't admin")
    res.status(403)

    return res.send("User is unauthorized")
  }

  const numberOfEvents = await eventsDB.GetNumberOfEvents(); 
  console.log("returning numberOfEvents ", numberOfEvents)

  return res.json(numberOfEvents)  
});



// Get number of users
router.get("/getNumberOfUsers", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    console.log("user isn't admin")
    res.status(403)

    return res.send("User is unauthorized")
  }

  const numberOfUsers = await usersDB.GetNumberOfUsers(); 
  console.log("returning numberOfUsers ", numberOfUsers)

  return res.json(numberOfUsers)  
});



module.exports = router;