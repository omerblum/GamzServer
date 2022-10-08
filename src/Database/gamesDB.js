const mySqlPassword = process.env['REACT_APP_MYSQL_PASSWORD']
const knex = require('knex');
var moment = require('moment');

// Connecting to the DB
const db = knex({
    client: 'mysql',
    connection: {
        host : 'localhost',
        user : 'root',
        password : mySqlPassword,
        database : 'livedbdev',
        typeCast: function (field, next) {
            if (field.type == 'DATE') {
              return moment(field.string()).format('YYYY-MM-DD');
            }
            return next();
          }        
    }
});

const c_gamesTableName = "games"



/* Get today games */
// Need to add filter by day
async function getTodayGames()
{
    var result = await db.select('*').from(c_gamesTableName);

    return result;
}

// /* Add new event */
// async function addG(newEvent)
// {
//     var wasInserted = true;
//     //inserting to table 'events' the new event
//     await db('events')
//         .insert(newEvent)
//         .catch(error =>
//         { 
//             console.log(error);
//             wasInserted = false
//         })
    
//     return wasInserted;
// }

// Returns if a game exist or not
async function gameExists(game)
{
    const { sport , competition, team_a, team_b, game_date, game_time} = game;
    console.log(`gameExists: Checking if a game exists with the following details: 
        sport: ${sport}, competition: ${competition}, team_a: ${team_a}, team_b: ${team_b}, game_date: ${game_date}, game_time: ${game_time}`)
    var gamesFound = await db(c_gamesTableName).select()
                    .where({sport: sport, competition: competition, team_a: team_a, team_b: team_b, game_date: game_date, game_time: game_time})
    if (gamesFound.length === 0)
    {
        console.log("game doesn't exist")
        return false;
    }
    else
    {
        console.log("game exist")
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
exports.getTodayGames = getTodayGames;
// exports.addEvent = addEvent;
exports.gameExists = gameExists;


