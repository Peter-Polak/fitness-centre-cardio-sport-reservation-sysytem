/**
 * Function that processes GET requests based on parameters.
 * @param parameters URL parameters.
 * @returns Response.
 */
function processGetRequest(parameters : any)
{
    let response : any;

    switch(parameters.request)
    {
        case "reservations":
        {
            let token = parameters.token;
            response = getReservationsByToken(token);
            break;
        }

        case "sessions":
        default:
        {
            let sessions = organizeSessions(getAllSessionsFromSheet());

            if(Object.keys(sessions).length === 0)
            {
                response = 
                {
                    value : sessions,
                    error : SessionsError.NO_SESSIONS
                };
            }
            else
            {
                response = sessions;
            }

            break;
        }     
    }

    return response;
}