const express = require("express");
const router = express.Router();
const uuid = require("uuid");
var axios = require('axios');
const eventsDB = require('../Database/eventsDB');


const apiKey = process.env['REACT_APP_GOOGLE_API_KEY']



// Get all events occur today
router.get("/", async (req, res) => 
{
  var allEventsToday = await eventsDB.getTodayEvents();

  res.send(allEventsToday)  
});



// Get specific event
router.get("/:event_id", async (req, res) => 
{
  var allEventsToday = await eventsDB.getTodayEvents();
  const id_to_look_for = req.params.event_id
  const found = allEventsToday.some(event => event.event_id === id_to_look_for);
  if (found) 
  {
    res.json(allEventsToday.filter(event => event.event_id === id_to_look_for));
  }
  else
  {
    res.sendStatus(400);
  }
});


// Update events is_verified status
router.put("/", async (req, res) => 
{
  var allEventsToday = await eventsDB.getTodayEvents();
  const allEventsToUpdate = req.body
  for (const eventToUpdate of allEventsToUpdate)
  {
    const event_id = eventToUpdate.event_id
    const found = allEventsToday.some(event => event.event_id === event_id);
    if (found) 
    {
      const is_verified = eventToUpdate.is_verified
      console.log(`Updating event: ${event_id} with the following is_verified status: ${is_verified}`)
      const updateSucceeded = await eventsDB.updateIsVerifiedEvent(event_id, is_verified)
      if (updateSucceeded)
      {
        console.log("updated successfully event with ID " + event_id + " is_verified status to " + is_verified)
      }
      else
      {
        console.log("failed updating is_verified status of event with ID " + event_id)
        return res.status(400)
      }
    } 
    else 
    {
      res.sendStatus(400);
      console.log(`Event with ID ${event_id} wasn't found, so we can't update it`)
    }
  }

  console.log("successfully upddated all events is_verified status")
  allEventsToday = await eventsDB.getTodayEvents();
  return res.json(allEventsToday)
});

// Add new event
router.post("/", async (req, res) => 
{    
  const placeId = req.body.place_id
  if (placeId === "")
  {
    console.log("post: recieved empty place ID, can't add the event")
    return res.sendStatus(400);
  }
  else
  {
    getGeoAnaNameByPlaceId(placeId)
      .then(async data => 
        {
          const newEvent = 
          {
            event_id: uuid.v4(),
            // locaion_id should be according to the publisher's business location we should alreayd have from his authentication
            game_id: req.body.game_id,
            place_id: placeId,
            place_name: data.name,
            // Verified event should be according to who created the event
            is_verified: false,
            sport: req.body.sport,
            team_a: req.body.team_a,
            team_b: req.body.team_b,
            competition: req.body.competition,
            event_date: req.body.event_date,
            event_time: req.body.event_time,
            lng: data.geometry.location.lng,
            lat: data.geometry.location.lat,
          };

          var addedSuccessfully = false;

          // TODO: Check if the event already exists
          if (await eventsDB.eventExists(newEvent))
          {
            console.log("The event already exists, nothing to do")
            return res.sendStatus(400);
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
            const allEvents = await eventsDB.getTodayEvents();
            return res.json(allEvents);
          }         
        })    
  }  
});


// //Update specific event
// router.put("/:event_id", async (req, res) => 
// {
//   var allEventsToday = await eventsDB.getTodayEvents();
//   const found = allEventsToday.some(event => event.event_id === req.params.event_id);
//   if (found) 
//   {
//     const updateevent = req.body;
//     allEventsToday.forEach(event => 
//     {
//       if (event.event_id === req.params.event_id) 
//       {
//         // update the event here
//         res.json({ msg: "event updated", event });
//       }
//     });
//   } 
//   else 
//   {
//     res.sendStatus(400);
//   }
// });

 
// //Delete event
// router.delete("/:event_id", (req, res) => 
// {
//   const found = events.some(event => event.event_id === req.params.event_id)
//   if (found) 
//   {
//     events = events.filter(event => event.event_id !== req.params.event_id)
//     res.json({
//       msg: "event deleted",
//       events
//     });
//   } 
//   else
//   {
//     res.sendStatus(400);
//   }
// });



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