const express = require("express");
const router = express.Router();
const uuid = require("uuid");
var axios = require('axios');
const eventsDB = require('../Database/eventsDB');
const usersDB = require('../Database/usersDB');


const apiKey = process.env.REACT_APP_GOOGLE_API_KEY

async function isUserAdmin(userInfo)
{
  const email = userInfo.email
  const user = await usersDB.GetUserInfoByEmail(email)
  console.log(user)
  console.log("isUserAdmin: got user info and is he admin = ", user.is_admin)
  return user.is_admin
}

// TODO: share this method since we use it also in SignIn
function getUserInfoFromGoogle(token) 
{  
    const URL = "https://www.googleapis.com/oauth2/v3/userinfo"
    return axios.get(URL, { headers: { Authorization: token } })
     .then(response => {
         return response.data;
      })
     .catch((error) => {
         console.log('getUserInfoFromGoogle: error ' + error);
      });
}

// Get all events 
router.get("/", async (req, res) => 
{
  var allEvents = await eventsDB.getAllEvents();

  res.send(allEvents)  
});



// Get specific place owner events
router.get("/myevents", async (req, res) => 
{
  console.log("GET myevents: start")
  const token = req.headers.authorization;
  var userInfo = await getUserInfoFromGoogle(token)
  if (await isUserAdmin(userInfo))
  {
    console.log("user is ", userInfo.name, "and he is an admin. Returning all events")
    const allEvents = await eventsDB.getAllEvents()

    return res.send(allEvents)
  }
  else
  { 
    console.log(`GET myevents: got user ${userInfo.name} info from google`)
    const userId = await usersDB.GetUserIdByEmail(userInfo.email, userInfo.name)
    
    var myEvents = await eventsDB.getMyEvents(userId, false);
    
    console.log(`GET myevents: got ${myEvents.length} events`)
    
    res.send(myEvents)  
  }
});





// Update events is_verified status
router.put("/", async (req, res) => 
{
  const token = req.headers.authorization;
  const user = await getUserInfoFromGoogle(token)
  const userId = await usersDB.GetUserIdByEmail(user.email, user.name)
  
  const allEventsToUpdate = req.body

  if (await isUserAdmin(user) || await CanUserUpdateEvents(userId, allEventsToUpdate, false))
  {    
    console.log("Events PUT: Updating the following events is_verified status: ", allEventsToUpdate)
    for (const eventToUpdate of allEventsToUpdate)
    {
      const event_id = eventToUpdate.event_id      
      const is_verified = eventToUpdate.is_verified
      console.log(`Events PUT: ${event_id} with the following is_verified status: ${is_verified}`)
      const updateSucceeded = await eventsDB.updateIsVerifiedEvent(event_id, is_verified)
      if (updateSucceeded)
      {
        console.log("Events PUT: updated successfully event with ID " + event_id + " is_verified status to " + is_verified)
      }
      else
      {
        console.log("Events PUT: failed updating is_verified status of event with ID " + event_id)
        return res.status(400)
      }      
    }
  
    console.log("Events PUT: successfully upddated all events is_verified status")
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

// Add new event
router.post("/", async (req, res) => 
{    

  const placeId = req.body.place_id
  const place_name = req.body.place_name
  if (placeId === "")
  {
    console.log("post: recieved empty place ID, can't add the event")
    return res.sendStatus(400);
  }
  else
  {
    const token = req.headers.authorization;
    const user = await getUserInfoFromGoogle(token)
    const userId = await usersDB.GetUserIdByEmail(user.email, user.name)
    const isPlaceOwnedByUser = await usersDB.GetIsUserOwingPlace(userId, placeId)
    const canUserAddEvent = await usersDB.GetCanUserAddEvent(userId, placeId, isPlaceOwnedByUser)
    if (!canUserAddEvent)
    {
      console.log("the user can't add event, reached limit, throttling")
      res.status(429)
      return res.send("Throttling - the user exceeded limit of new events creation today")
    }

    
    console.log("is the user ", userId, "owns place ", place_name, "with place ID: ", placeId, "? ", isPlaceOwnedByUser)

    getGeoAnaNameByPlaceId(placeId)
      .then(async data => 
        {
          const newEvent = 
          {
            event_id: uuid.v4(),
            // locaion_id should be according to the publisher's business location we should alreayd have from his authentication
            game_id: req.body.game_id,
            place_id: placeId,
            place_name: place_name,
            is_verified: isPlaceOwnedByUser,
            sport: req.body.sport,
            team_a: req.body.team_a,
            team_b: req.body.team_b,
            competition: req.body.competition,
            event_date: req.body.event_date,
            event_time: req.body.event_time,
            lng: data.geometry.location.lng,
            lat: data.geometry.location.lat,
            has_volume: req.body.has_volume,
            user_created_event_id: userId
          };

          var addedSuccessfully = false;

          // TODO: Check if the event already exists
          if (await eventsDB.eventExists(newEvent))
          {
            console.log("The event already exists, nothing to do")
            return res.sendStatus(201);
          }
          else
          {
            console.log("Trying to add new event")
            addedSuccessfully = await eventsDB.addEvent(newEvent);
          }

          if (!addedSuccessfully) 
          {
            console.log("Failed adding new event")

            return res.sendStatus(400);
          }
          else
          {
            console.log("added new event succesffuly with event ID: " + newEvent.event_id)
            const allEvents = await eventsDB.getAllEvents();
            return res.json(allEvents);
          }         
        })    
  }  
});


router.delete("/", async (req, res) => 
{

  const token = req.headers.authorization;
  const user = await getUserInfoFromGoogle(token)
  const userId = await usersDB.GetUserIdByEmail(user.email, user.name)
  
  const eventIDsToDelete = req.body.deletedEventsIDs

  if (await CanUserUpdateEvents(userId, eventIDsToDelete, true))
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
  // console.log("CanUserUpdateEvents: IDs the user can update are: ", eventsUserCanUpdateIDs )
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


function getGeoAnaNameByPlaceId(placeId)
{  
  const url ='https://maps.googleapis.com/maps/api/place/details/json?fields=name,geometry&place_id=' + placeId + '&key=' + apiKey
  var config = 
  {
    method: 'get',
    url: url,
    headers: { }
  };
  
  return axios(config)
  .then(function (response) 
  {
    const data = response.data
    console.log(`getGeoByPlaceId: Successfuly got location for placeID ${placeId}`);
    return data.result
  })
  .catch(function (error) 
  {
    console.log(`getGeoByPlaceId: Failed while getting ${placeID} geo details. Error: ${error}`);
    return null;    
  });
}

module.exports = router;