function doGet(event : any)
{
    let response = processGetRequest(event.parameter);
    
    return ContentService.createTextOutput(JSON.stringify(response));
}

function doPost(event : any)
{
    let response = processPostRequest(event.parameter);

    return ContentService.createTextOutput(JSON.stringify(response));
}

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

function processPostRequest(parameters : any)
{
    let reservationForm = new ReservationForm(parameters.timestamp, parameters.name, parameters.surname, parameters.emailAddress, parameters.sessionsString);
    
    let response = processWebAppReservationForm(reservationForm);

    return response;
}