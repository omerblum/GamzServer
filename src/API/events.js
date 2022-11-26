const express = require("express");
const router = express.Router();
const uuid = require("uuid");
var axios = require('axios');
const eventsDB = require('../Database/eventsDB');
const usersDB = require('../Database/usersDB');
const gamesDB = require('../Database/gamesDB');
const placesDB = require('../Database/placesDB');
const usersAPI = require('./users');
const placesUtils = require('../Utils/PlacesUtils')

// Get all events 
router.get("/", async (req, res) => 
{
  var allEvents = await eventsDB.getAllEvents();

  res.send(allEvents)  
});

router.get("/byplace/:id", async (req, res) => 
{
  console.log("GET place events: start")
  const placeId = req.params.id
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (userInfo == null)
    {
      console.log("failed to get user info from google, returning empty array of events")
      return res.send([])
    }
    console.log(`GET place events: got user ${userInfo.name} info from google`)
    
    var events = await eventsDB.getPlaceEvents(placeId);
    
    console.log(`GET place events: got ${events.length} events`)
    
    res.send(events)  
});


// Get specific place owner events
router.get("/myevents", async (req, res) => 
{
  console.log("GET myevents: start")
  const token = req.headers.authorization;
  var userInfo = await usersAPI.getUserInfoFromGoogle(token)
  if (await usersAPI.isUserAdmin(userInfo))
  {
    console.log("user is ", userInfo.name, "and he is an admin. Returning all events")
    const allEvents = await eventsDB.getAllEvents()

    return res.send(allEvents)
  }
  else
  { 
    if (userInfo == null)
    {
      console.log("failed to get user info from google, returning empty array of events")
      return res.send([])
    }
    console.log(`GET myevents: got user ${userInfo.name} info from google`)
    const userId = await usersDB.GetUserIdByEmail(userInfo.email, userInfo.name)
    
    var myEvents = await eventsDB.getPlaceEvents(userId, false);
    
    console.log(`GET myevents: got ${myEvents.length} events`)
    
    res.send(myEvents)  
  }
});


// Update events fields
router.put("/", async (req, res) => 
{
  const token = req.headers.authorization;
  const user = await usersAPI.getUserInfoFromGoogle(token)
  if (user == null)
  {
    console.log("failed getting info about user, blocking the request")
    res.status(403)
    return res.send("User isn't authenticated")
  }
  const userId = await usersDB.GetUserIdByEmail(user.email, user.name)
  
  const allEventsToUpdate = req.body

  if (await usersAPI.isUserAdmin(user) || await CanUserUpdateEvents(userId, allEventsToUpdate, false))
  {    
    console.log("Events PUT: Updating the following events: ", allEventsToUpdate)
    for (const eventToUpdate of allEventsToUpdate)
    {
      const event_id = eventToUpdate.event_id      
      const has_volume = eventToUpdate.has_volume
      console.log(`Events PUT: updating ${event_id}`)
      let updateSucceeded = true
      if (has_volume !== undefined) {
        if (!await eventsDB.updateEventField(event_id, "has_volume", has_volume)) {
          updateSucceeded = false
        }
      }
      if (updateSucceeded)
      {
        console.log("Events PUT: updated successfully event with ID " + event_id)
      }
      else
      {
        console.log("Events PUT: failed updating status of event with ID " + event_id)
        return res.status(400)
      }      
    }
  
    console.log("Events PUT: successfully upddated all given events")
    var allEvents = await eventsDB.getAllEvents();
    return res.json(allEvents)
  }
  else
  {
    console.log("Events PUT: User is trying to update events he doesn't own, forbidden")
    res.status(401)
    return res.send("unauthorized - trying to update events user don't own")
  }
});

// Add new events
router.post("/addMultipleEvents", async (req, res) => 
{    
  const placeId = req.body.place_id
  const place_name = req.body.place_name
  const has_volume = req.body.has_volume
  const gamesIDs = req.body.gamesIDs
  if (placeId === "" || gamesIDs?.length < 1)
  {
    console.log("post: recieved empty place ID or no game IDs, returning")
    return res.sendStatus(400);
  }

  console.log(`Adding new ${gamesIDs.length} events`)

  const token = req.headers.authorization;
  const user = await usersAPI.getUserInfoFromGoogle(token)
  if (user == null)
  {
    console.log("failed getting info about user, blocking the request")
    res.status(403)
    return res.send("User isn't authenticated")
  }

  const userId = await usersDB.GetUserIdByEmail(user.email, user.name)
  const userIsAdmin = await usersAPI.isUserAdmin(user)
  const isPlaceOwnedByUser = await usersDB.GetIsUserOwingPlace(userId, placeId)
  const canUserAddEvent = await usersDB.GetCanUserAddEvent(userId, placeId, isPlaceOwnedByUser, userIsAdmin)
  if (!canUserAddEvent)
  {
    console.log("the user can't add event")
    res.status(403)
    return res.send("Access Denied.")
  }
  
  console.log("is the user ", userId, "owns place ", place_name, "with place ID: ", placeId, "? ", isPlaceOwnedByUser)
  
  const placeInfo = await placesUtils.getPlaceInfoByPlaceIdFromGoogle(placeId)
  await placesDB.AddPlaceIfNotAlready(placeInfo, placeId)

  var place = await placesDB.GetPlaceInfo(placeId) 
  var aboutPlace = null
  var bookonlineLink = null

  if (place.length > 0)
  {
    place = place[0]
    aboutPlace = place.place_about
    bookonlineLink = place.book_online
  }

  var eventsToAdd = []

  for (const gameID of gamesIDs)
  {
    console.log("now handling game ID: ", gameID)
    console.log("Getting game info of game ID: ", gameID)
    const gameInfo = await gamesDB.GetGameInfoByGameIDFromDB(gameID)
    if (gameInfo == null)
    {
      console.log(`Game with ID ${gameID} doesn't exist`)
      continue;
    }

    console.log("game info is: ", gameInfo)

    const newEvent = 
    {
      event_id: uuid.v4(),
      game_id: gameID,
      place_id: placeId,
      place_name: place_name,
      place_address: placeInfo.formatted_address,
      place_phone: placeInfo.formatted_phone_number,
      sport: gameInfo.sport,
      team_a: gameInfo.team_a,
      team_b: gameInfo.team_b,
      competition: gameInfo.competition,
      event_date: gameInfo.game_date,
      event_time: gameInfo.game_time,
      lng: placeInfo.geometry.location.lng,
      lat: placeInfo.geometry.location.lat,
      has_volume: has_volume,
      user_created_event_id: userId,
      about_place: aboutPlace,
      book_online: bookonlineLink,
    };

    if (await eventsDB.eventExists(newEvent))
    {
      console.log("The event already exists, nothing to do")
      continue;
    }
    
    eventsToAdd.push(newEvent)

  }

  var addedSuccessfully = false;
  console.log(`Trying to add the new ${eventsToAdd.length} events`)
  addedSuccessfully = await eventsDB.addEvents(eventsToAdd);
  if (!addedSuccessfully) 
  {
    console.log("Failed adding new events")
  }
  else
  {
    console.log("added new events succesffuly")
  }  

  const allEvents = await eventsDB.getAllEvents();
  return res.json(allEvents);    
   
});



router.delete("/", async (req, res) => 
{

  const token = req.headers.authorization;
  const user = await usersAPI.getUserInfoFromGoogle(token)
  if (user == null)
  {
    console.log("failed getting info about user, blocking the request")
    res.status(403)
    return res.send("User isn't authenticated")
  }
  const userId = await usersDB.GetUserIdByEmail(user.email, user.name)
  const userIsAdmin = await usersAPI.isUserAdmin(user)
  
  const eventIDsToDelete = req.body.deletedEventsIDs

  if (userIsAdmin || await CanUserUpdateEvents(userId, eventIDsToDelete, true))
  {
    console.log("Events DELETE: deleting the following events: ", eventIDsToDelete)
    const deleteSucceeded = await eventsDB.DeleteEvents(eventIDsToDelete);
    console.log("Events DELETE: Operation completed with success? ", deleteSucceeded)
    
    if (deleteSucceeded)
    {
      res.status(200)
      return res.send("deleted")
    }
    else
    {
      res.status(400)
      return res.send("failed deleting")
    }
  }
  else
  {
    console.log("Events PUT: User is trying to update events he doesn't own, forbidden")
    res.status(401)
    return res.send("unauthorized - trying to update events user don't own")
  }
});


async function CanUserUpdateEvents(userID, eventsToCheck, eventsToCheckAreEventIDs)
{
  const eventsUserCanUpdate = await eventsDB.getMyEvents(userID, true)
  let eventsUserCanUpdateIDs = eventsUserCanUpdate.map(e => e.event_id);
  console.log("CanUserUpdateEvents: IDs the user can update are: ", eventsUserCanUpdateIDs )

  console.log("CanUserUpdateEvents: IDs the user trying to update are: ", eventsToCheck )
  let onlyEventIDs = eventsToCheck
  if (!eventsToCheckAreEventIDs)
  {
    console.log("not only IDs, extracting them")
    onlyEventIDs = eventsToCheck.map(e => e.event_id);
  }

  console.log("checking this array: ", onlyEventIDs)
  
  const result = onlyEventIDs.every(event_id => eventsUserCanUpdateIDs.includes(event_id));
  console.log("CanUserUpdateEvents: Does all events the user is trying to update are his events? : ", result)

  return result
}




module.exports = router;
