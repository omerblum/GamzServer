const mySqlPassword = process.env.REACT_APP_MYSQL_PASSWORD
const mySqlUser = process.env.REACT_APP_MYSQL_USER
const mySqlUrl = process.env.REACT_APP_MYSQL_URL
const knex = require('knex');
var moment = require('moment');

const db = knex({
    client: 'mysql',
    connection: {
        host : mySqlUrl,
        user : mySqlUser,
        password : mySqlPassword,
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



/* Get games that didn't happen yet */
async function GetRelevantGames()
{
    const now = moment().format('YYYY-MM-DD')
    var result = await db.select('*')
    .where('game_date','>=', [now])
    .orderBy('game_date', 'asc')
    .from(c_gamesTableName);

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

// Returns game info if exists
async function GetGameInfoByGameIDFromDB(gameID)
{
    var gamesFound = await db(c_gamesTableName).select()
                    .where({game_id: gameID})
    if (gamesFound.length === 0)
    {
        console.log("game doesn't exist")
        return null;
    }
    else
    {
        console.log("game exist")
        return gamesFound[0];
    }   
}
 

/* Exporting all functions */
exports.GetRelevantGames = GetRelevantGames;
exports.gameExists = gameExists;
exports.GetGameInfoByGameIDFromDB = GetGameInfoByGameIDFromDB;


