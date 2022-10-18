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

const c_usersTableName = "users"


/* Add new event */
async function AddUser(newUser)
{
    const {user_id, name, given_name, email, owns_business} = newUser;
    console.log(`AddUser: Trying to add new user ${name} with email ${email} user_id ${user_id} given_name ${given_name} owns_business ${owns_business}`)
    var wasInserted = true;
    //inserting to table 'users' the new user
    await db(c_usersTableName)
        .insert(newUser)
        .then(console.log(`AddUser: Successfully added user ${name} with email ${email}`))
        .catch(error =>
        { 
            console.log(`AddUser: Failed adding user ${name} with email ${email} due to error: ${error}`);
            wasInserted = false
        })
    
    return wasInserted;
}



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
async function GetUserIdByEmail(email, user_name)
{
    console.log(`GetUserIdByEmail: Checking if a user ${user_name} exists with email ${email}`)
    var userFound = await db(c_usersTableName).select()
                    .where({email: email})
    if (userFound.length === 0)
    {
        console.log(`GetUserIdByEmail: user ${user_name} with email ${email} doesn't exist`)
        return null;
    }
    else
    {
        console.log(`GetUserIdByEmail: user ${user_name} with email ${email} exist`)
        return userFound[0].user_id;
    }   
}



/* Exporting all functions */
exports.AddUser = AddUser;
exports.GetUserIdByEmail = GetUserIdByEmail;



