// --------------------------------------
// Scripts for handling reservation form.
// --------------------------------------

//#region Google Form

/**
 * Even handler for `On form submit` event.
 * @param formResponseEvent Form submit event arguments.
 */
 function onFormSubmitInstallable(formResponseEvent : GoogleAppsScript.Events.SheetsOnFormSubmit)
 {
     //#region Check form response structure
     
     if(formResponseEvent === undefined) return;
     
     const data = formResponseEvent.values; // Form data in array, ordered as in sheet of responses
     
     if(data[0] === undefined || data[1] === undefined || data[2] === undefined || data[3] === undefined) return;
     
     const timestamp = data[0];
     const name = data[1];
     const surname = data[2];
     const sessions = data[3];
     const emailAddress = data[4];
     
     //#endregion
 
     let reservationForm = new ReservationForm(
         timestamp, name, surname, emailAddress, sessions
     );
     
     processReservationForm(reservationForm);
 }

 /**
 * Update form, more specifically free sessions with the current state.
 */
function updateGoogleForm()
{
    //#region Session Sheet
    
    let sessionSheet = getSessionSheet();
    if(sessionSheet == null) return;
    let sessionSheetCells = sessionSheet.getDataRange().getValues();
    
    //#endregion
    
    //#region Form
    
    let form = getForm();
    if(form == undefined) return;
    
    let freeSessionCheckboxes = form.getItems(FormApp.ItemType.CHECKBOX)[0].asCheckboxItem();
    let newFreeSessions = [];
    
    //#endregion
    
    //#region Loop through all session rows (skip first 4 rows because they are headers) and find free and active sessions
    
    for(let n = 4; n < sessionSheetCells.length; n++)
    {
        let currentDate = new Date();
        let session = getSessionFromSheet(sessionSheetCells, n);
        if(session == undefined) return;
        
        if(session.getFreeSpaces > 0 && session.capacity > 0 && (currentDate.getTime() <= session.startDate.getTime())) // If there is free space and tha capacity isn't 0 and the session hasn't already started
        {
            let checkboxChoice = `${session.getDateString} ${session.getTimeString} (${session.getFreeSpaces}/${session.capacity})`;
            newFreeSessions.push(checkboxChoice);
        }
    }
    
    //#endregion
    
    //#region Update checkbox choices with new free sessions
    
    if(newFreeSessions.length == 0) newFreeSessions.push("Nie sú žiadne voľné termíny.");
    if(newFreeSessions.length > 0) freeSessionCheckboxes.setChoiceValues(newFreeSessions);
    
    //#endregion
}

//#endregion

//#region Web App Form

/**
 * Appends the reservation form response, checks it's validity and processes it.
 * @param reservationForm Reservation form to process.
 * @returns {ReservationFormValidity} Reservation form validity object.
 */
function processWebAppReservationForm(reservationForm : ReservationForm) : ReservationFormValidity
{
    appendReservationFormResponse(reservationForm);
    
    let reservationValidity = checkReservationFormValidity(reservationForm);
    if(reservationValidity.isValid) processReservationForm(reservationForm);
    
    return reservationValidity;
}

/**
 * Appends the reservation form response to the `Responses - Web App` sheet.
 * @param reservationForm Reservation form to append.
 */
function appendReservationFormResponse(reservationForm : ReservationForm)
{
    let webAppResponsesSheet = getWebAppResponsesSheet();
    if(webAppResponsesSheet == null) return;
    
    const row = 
    [
        reservationForm.timestamp, 
        reservationForm.name, 
        reservationForm.surname, 
        reservationForm.sessionsString,
        reservationForm.emailAddress
    ];
    
    webAppResponsesSheet.appendRow(row);
}

//#endregion

/**
 * Process all the reservations(appends them to the `Reservations` sheet), updates Google Form and sends confirmation e-mail (if user specified an e-mail address).
 * @param reservationForm Reservation form to process.
 */
function processReservationForm(reservationForm : ReservationForm)
{
    appendReservations(reservationForm.reservations);
    updateGoogleForm();
    if(reservationForm.emailAddress != "" && reservationForm.emailAddress) sendConfirmationEmail(reservationForm); // Send a confirmation e-mail if the user specified an e-mail address.
}