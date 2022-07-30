const express = require("express");
const router = express.Router();
const uuid = require("uuid");
let events = require("../Events");

router.get("/", (req, res) => 
{
  res.json(events);
});

// Get event
router.get("/:event_id", (req, res) => 
{
  console.log(req.params.event_id)
  const id_to_look_for = req.params.event_id
  console.log("id we're looking for is" + id_to_look_for)
  const found = events.some(event => event.event_id === id_to_look_for);
  if (found) 
  {
    res.json(events.filter(event => event.event_id === id_to_look_for));
  }
  else
  {
    res.sendStatus(400);
  }
});


router.post("/", (req, res) => 
{  
  // Geometry should be acording to the publihser's business location we should alreayd have from his authentication
  const geometry = 
  {
    lat: 32.0859,
    lng: 34.7820
  }

  const event_details = req.body.event_details
  event_details.geo = geometry

  const newevent = 
  {
    event_id: uuid.v4(),
    // locaion_id should be acotding to the publisher's business location we should alreayd have from his authentication
    location_id: 2,
    location_name: req.body.location_name,
    event_details: event_details
  };

  if (!newevent.location_name || !newevent.event_details) 
  {
    return res.sendStatus(400);
  }

  events.push(newevent);

  res.json(events);
});


//Update event
router.put("/:event_id", (req, res) => 
{
  const found = events.some(event => event.event_id === req.params.event_id);
  if (found) 
  {
    const updateevent = req.body;
    events.forEach(event => 
    {
      if (event.event_id === req.params.event_id) 
      {
        // update the event here
        res.json({ msg: "event updated", event });
      }
    });
  } 
  else 
  {
    res.sendStatus(400);
  }
});

 
//Delete event
router.delete("/:event_id", (req, res) => 
{
  const found = events.some(event => event.event_id === req.params.event_id)
  if (found) 
  {
    events = events.filter(event => event.event_id !== req.params.event_id)
    res.json({
      msg: "event deleted",
      events
    });
  } 
  else
  {
    res.sendStatus(400);
  }
});

module.exports = router;