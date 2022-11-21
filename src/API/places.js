const express = require("express");
const router = express.Router();
const uuid = require("uuid");
var axios = require('axios');
const usersDB = require('../Database/usersDB');
const placesDB = require('../Database/placesDB');
const usersAPI = require('./users');

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY

// Get all places 
router.get("/", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    res.status(403)

    return res.send("User is unauthorized")
  }
  var allEvents = await placesDB.GetAllPlaces();

  return res.send(allEvents)  
});

// Get all authorized places 
router.get("/authorizedPlaces", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    console.log("user isn't admin")
    res.status(403)

    return res.send("User is unauthorized")
  }

  var allEvents = await placesDB.GetAllauthorizedPlaces();

  return res.send(allEvents)  
});

// Get all unauthorized places 
router.get("/unauthorizedPlaces", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    res.status(403)
    return res.send("User is unauthorized")
  }
  var allEvents = await placesDB.GetAllUnauthorizedPlaces();

  return res.send(allEvents)  
});

// Approve place
router.post("/approvePlace", async (req, res) => 
{
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (!await usersAPI.isUserAdmin(userInfo))
  {
    res.status(403)

    return res.send("User is unauthorized")
  }

  const placeIdToApprove = req?.body?.placeToApprove?.placeId
  console.log("approvePlace: Approving place ", placeIdToApprove)

  var placeApproved = await placesDB.ApprovePlace(placeIdToApprove);
  console.log("approvePlace: was place approved? ", placeApproved)
  
  return res.send(placeApproved)  
});



module.exports = router;

