// const mySqlPassword = process.env['REACT_APP_MYSQL_PASSWORD']
const mySqlPassword = "c626a9bd"
const knex = require('knex');
var moment = require('moment');

// Connecting to the DB
// const db = knex({
//     client: 'mysql',
//     connection: {
//         host : 'localhost',
//         user : 'root',
//         password : mySqlPassword,
//         database : 'livedbdev',
//         typeCast: function (field, next) {
//             if (field.type == 'DATE') {
//               return moment(field.string()).format('YYYY-MM-DD');
//             }
//             return next();
//           }        
//     }
// });
const db = knex({
    client: 'mysql',
    connection: {
        host : 'eu-cdbr-west-03.cleardb.net',
        user : 'b1f969e16b070a',
        password : '16e932a8',
        database : 'heroku_4f3adb018c97aae',
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


    

/* Exporting all functions */
exports.getTodayGames = getTodayGames;
exports.gameExists = gameExists;


