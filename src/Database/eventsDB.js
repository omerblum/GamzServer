const mySqlPassword = process.env['REACT_APP_MYSQL_PASSWORD']
const knex = require('knex');
// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: mySqlPassword,
//     database: 'livedbdev'
//   });
  
//   connection.connect(function(err) {
//     if (err) {
//       return console.error('error: ' + err.message);
//     }
  
//     console.log('Connected to the MySQL server.');
//   });

/* 
    This class handle all requests to the data base
*/

// Connecting to the DB
const db = knex({
    client: 'mysql',
    connection: {
        host : 'localhost',
        user : 'root',
        password : mySqlPassword,
        database : 'livedbdev',        
    }
});



/* Get today events */
// Need to add filter by day
async function getTodayEvents()
{
    var result = await db.select('*').from('events');

    return result;
}

/* Add new event */
async function addEvent(newEvent)
{
    var wasInserted = true;
    //inserting to table 'events' the new event
    await db('events')
        .insert(newEvent)
        .catch(error =>
        { 
            console.log(error);
            wasInserted = false
        })
    
    return wasInserted;
}

async function eventExists(event)
{
    const { game_id , place_id, event_date, event_time} = event;
    console.log(`eventExists: Checking if an event exists with the following details: game_id: ${game_id}, place_id: ${place_id}, event_date: ${event_date}, event_time: ${event_time}`)
    var eventsFound = await db('events').select()
                    .where({game_id: game_id, place_id: place_id, event_date: event_date, event_time: event_time})
    console.log(eventsFound.length === 0)
    if (eventsFound.length === 0)
    {
        console.log("event doesn't exist")
        return false;
    }
    else
    {
        console.log("event exist")
        return true;

    }   
}

// async function profileEditVolunteer(updatedVolunteer)
// {
//     var wasUpdated = true;
//     const { id ,firstName, lastName, age, city, street, homeNumber, apartmentNumber,floor, howHeardOfUs, email, comments, sex} = updatedVolunteer;

//     await db('volunteers')
//         .update({firstName: firstName, lastName: lastName, age:age, city:city, street:street, homeNumber:homeNumber,
//             apartmentNumber:apartmentNumber, floor: floor,howHeardOfUs:howHeardOfUs, email:email, comments:comments , sex:sex})
//         .where({id:id})
//         .catch(e => 
//         {
//             console.log(e);
//             wasUpdated = false;
//         });
//     return wasUpdated;
// }


/* Sign in */

// async function isUserApproved(phoneNumber)
// {
//     var user_data = false;
//     try 
//     {
//         const result = await db.select('*').from('volunteers').where('phoneNumber', phoneNumber);
//         if (result) 
//         {
//             user_data = result;  
//         } 
//     }
//     catch(error)
//     {
//         console.log(error);
//     }

//     return user_data;
// }
    

/* Exporting all functions */
exports.getTodayEvents = getTodayEvents;
exports.addEvent = addEvent;
exports.eventExists = eventExists;


