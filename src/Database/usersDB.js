const mySqlPassword = process.env.REACT_APP_MYSQL_PASSWORD
const mySqlUser = process.env.REACT_APP_MYSQL_USER
const mySqlUrl = process.env.REACT_APP_MYSQL_URL
const knex = require('knex');
var moment = require('moment');

// Connecting to the DB
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

const c_usersTableName = "users"
const c_placesTableName = "places"
const c_maxEventsCreationInADay = 5;


// Update user owns business
async function UpdateUsersOwnsBusines(user_id)
{
    console.log("UpdateUsersOwnsBusines: Approving user ", user_id)
    const wasUpdated = true;
    await db(c_usersTableName)
        .update("owns_business", 1)
        .where({user_id})
        .catch(error =>
        { 
            console.log(error);
            wasUpdated = false
        })

    return wasUpdated;
}

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

async function GetNumberOfUsers()
{
    console.log(`GetNumberOfUsers: Getting number of users`)
    var users = await db(c_usersTableName).select('*')
                   
    return users.length
}


async function GetUserInfoByEmail(email)
{
    console.log(`GetUserInfoByEmail: Getting user info drom DB with user email: '${email}'`)
    var userFound = await db(c_usersTableName).select()
                    .where({email: email})
    if (userFound.length === 0)
    {
        console.log(`GetUserInfoByEmail: user with email ${email} doesn't exist`)
        return null;
    }
    else
    {
        console.log(`GetUserInfoByEmail: user with email '${email}' exist`)
        return userFound[0];
    }  
}

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

async function GetIsUserOwingPlace(userId, placeId)
{
    console.log(`GetIsUserOwingPlace: Checking if  user ${userId} owns place ${placeId}`)
    var userOwnPlace = await db(c_placesTableName).select()
                    .where({place_id: placeId, owner_id: userId})
    if (userOwnPlace.length === 0)
    {
        console.log(`GetIsUserOwingPlace: user ${userId} doesn't owns place ${placeId}`)
        return false;
    }
    else
    {
        console.log(`GetIsUserOwingPlace: user ${userId} owns place ${placeId}`)
        return true;
    } 
}

async function GetCanUserAddEvent(userId, placeId, isPlaceOwnedByUser, userIsAdmin)
{
    console.log("GetCanUserAddEvent: Checking if user ", userId, "is allowed to add event for place ", placeId)
    if (isPlaceOwnedByUser || userIsAdmin)
    {
        console.log(`GetCanUserAddEvent: The user ${userId} either admin or owns the place, so allowing him to create the event`)
        return true;
    }

    return false;
}



/* Exporting all functions */
exports.AddUser = AddUser;
exports.GetUserIdByEmail = GetUserIdByEmail;
exports.GetIsUserOwingPlace = GetIsUserOwingPlace;
exports.GetCanUserAddEvent = GetCanUserAddEvent;
exports.GetUserInfoByEmail = GetUserInfoByEmail;
exports.GetNumberOfUsers = GetNumberOfUsers;
exports.UpdateUsersOwnsBusines = UpdateUsersOwnsBusines;



