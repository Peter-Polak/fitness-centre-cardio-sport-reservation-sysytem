function doGet(event : any)
{
    let parameters = event.parameter;
    
    let sessions = organizeSessions(getAllSessionsFromSheet());
    
    return ContentService.createTextOutput(JSON.stringify(sessions));
}

function doPost(event : any)
{
    let parameters = event.parameter;
    let reservation = new Reservation(parameters.timestamp, parameters.name, parameters.surname, parameters.sessions, parameters.emailAddress);
    
    let response = processNewReservation(reservation);
    
    return ContentService.createTextOutput(JSON.stringify(response));
}