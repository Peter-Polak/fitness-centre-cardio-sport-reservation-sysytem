function doGet(event : any)
{
    let parameters = event.parameter;
    
    let response : OrganizedSessions | Reason<OrganizedSessions, SessionsError> = organizeSessions(getAllSessionsFromSheet());
    
    if(Object.keys(response).length === 0)
    {
        response = 
        {
            value : response,
            error : SessionsError.NO_SESSIONS
        };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response));
}

function doPost(event : any)
{
    let parameters = event.parameter;
    let reservationForm = new ReservationForm(parameters.timestamp, parameters.name, parameters.surname, parameters.emailAddress, parameters.sessionsString);
    
    let response = processWebAppReservationForm(reservationForm);
    
    return ContentService.createTextOutput(JSON.stringify(response));
}