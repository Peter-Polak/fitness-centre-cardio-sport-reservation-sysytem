/**
 * Handler for all GET requests.
 * @param event Event object with query parameters.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(event : any) : GoogleAppsScript.Content.TextOutput
{
    let response = processGetRequest(event.parameter);
    
    return ContentService.createTextOutput(JSON.stringify(response));
}

/**
 * Handler for all POST requests.
 * @param event Event object with query parameters.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(event : any) : GoogleAppsScript.Content.TextOutput
{
    let response = processPostRequest(event.parameter);

    return ContentService.createTextOutput(JSON.stringify(response));
}

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

/**
 * Function that processes POST requests based on parameters.
 * @param parameters URL parameters.
 * @returns {ReservationFormValidity} Response.
 */
function processPostRequest(parameters : any) : ReservationFormValidity
{
    let reservationForm = new ReservationForm(parameters.timestamp, parameters.name, parameters.surname, parameters.emailAddress, parameters.sessionsString);
    
    let response = processWebAppReservationForm(reservationForm);

    return response;
}