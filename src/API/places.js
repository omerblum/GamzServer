const express = require("express");
const router = express.Router();
const uuid = require("uuid");
var axios = require('axios');
const usersDB = require('../Database/usersDB');
const placesDB = require('../Database/placesDB');
const usersAPI = require('./users');
const eventsAPI = require('./users');
const placeUtils = require('../Utils/PlacesUtils')


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


router.put("/", async (req, res) => 
{    
  console.log("started adding new place")
  const placeId = req.body.place_id

  if (placeId === "" )
  {
    console.log("Add new place: recieved empty place ID or no game IDs, returning")
    return res.sendStatus(400);
  }

  const token = req.headers.authorization;
  const user = await usersAPI.getUserInfoFromGoogle(token)
  if (user == null)
  {
    console.log("failed getting info about user, blocking the request")
    res.status(403)
    return res.send("User isn't authenticated")
  }

  const placeInfo = await  placeUtils.getPlaceInfoByPlaceIdFromGoogle(placeId)
  const userId = await usersDB.GetUserIdByEmail(user.email, user.name)

  const newPlace = 
  {
    place_id: placeId,
    owner_email: req.body.owner_email,
    book_online: req.body.book_online,
    phone: req.body.phone,
    place_about: req.body.place_about,
    owner_name: user.name,
    place_name : placeInfo?.name,
    owner_id: userId,
    is_authorized: 0
  }

  const sucess = await placesDB.AddNewPlace(newPlace)

  console.log(`Added new place with ID ${placeId} ended with success = ${sucess}`)

  return res.json(sucess)
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

  var userId = await placesDB.GetOwnerIdFromPlaceId(placeIdToApprove)
  if (userId.length > 0)
  {
    userId = userId[0].owner_id
    const updated = await usersDB.UpdateUsersOwnsBusines(userId)
    console.log(`user with ID ${userId} updated = ${updated}`)
  }
  
  return res.send(placeApproved)  
});



module.exports = router;

