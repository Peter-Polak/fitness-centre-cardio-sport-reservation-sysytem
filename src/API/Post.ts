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