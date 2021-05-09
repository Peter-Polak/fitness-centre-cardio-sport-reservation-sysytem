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
            emailAddress : row[0],
            token : row[1]
        }
        
        users.push(user);
    }
    
    return users;
}

function getUserByEmail(emailAddress : string): User | null
{
    const users = getAllUsers();
    
    for(const user of users)
    {
        if(user.emailAddress == emailAddress) return user;
    }
    
    return null;
}

function getUserByToken(token : string): User | null
{
    const users = getAllUsers();
    
    for(const user of users)
    {
        if(user.token == token.toUpperCase()) return user;
    }
    
    return null;
}