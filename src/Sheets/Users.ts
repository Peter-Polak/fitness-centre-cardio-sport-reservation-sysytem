/**
 * Generate a new random verification token for the new user and add the new user to `Users` sheet.
 * @returns {User} Newly added user object.
 */
function addUser(emailAddress : string) : User
{
    const usersSheet = getUsersSheet();
    if(usersSheet == null) return { emailAddress : "", token : "" };
    
    const users = getAllUsers();
    let token = "";
    let isUnique = true;
    
    // Check if user already exists or if the generated token is already assigned to another user
    let limit = 0;
    do
    {
        token = getToken();
        
        for(const user of users)
        {
            if(user.emailAddress == emailAddress) return user;
            if(user.token == token)
            {
                isUnique = false;
                break;
            }
        }
        
        limit++;
    }
    while(!isUnique && limit < 100)
    
    if(!isUnique) throw Error("Failed to generate unique token for new user!")
    
    let user : User = 
    {
        emailAddress : emailAddress,
        token : token
    }
    
    usersSheet.appendRow([user.emailAddress, user.token]);
    
    return user;
}

/**
 * Get all users from `Users` sheet.
 * @returns {Array<User>} Array of all users.
 */
function getAllUsers() : Array<User>
{
    const usersSheet = getUsersSheet();
    if(usersSheet == null) return [];

    const cells = usersSheet.getDataRange().getValues();
    
    let users : Array<User> = [];
    for(const row of cells)
    {
        const user : User =
        {
            emailAddress : row[UsersSheet.columns.EmailAddress],
            token : row[UsersSheet.columns.Token]
        }
        
        users.push(user);
    }
    
    return users;
}

/**
 * Get user from `Users` sheet by e-mail adress.
 * @returns {User | null} User object or null if not found.
 */
function getUserByEmail(emailAddress : string): User | null
{
    const users = getAllUsers();
    
    for(const user of users)
    {
        if(user.emailAddress == emailAddress) return user;
    }
    
    return null;
}

/**
 * Get user from `Users` sheet by token.
 * @returns {User | null} User object or null if not found.
 */
function getUserByToken(token : string): User | null
{
    const users = getAllUsers();
    
    for(const user of users)
    {
        if(user.token == token.toUpperCase()) return user;
    }
    
    return null;
}