/**
 * Scripts for form handling.
 */

/**
 * Even handler for event on form submit.
 * @param formResponseEvent Form submit event arguments.
 */
function onFormSubmitInstallable(formResponseEvent : GoogleAppsScript.Events.SheetsOnFormSubmit)
{
    //#region Check form response structure
    
    if(formResponseEvent === undefined) return;
    
    let data = formResponseEvent.values; // Form data in array, ordered as in sheet of responses
    
    if(data[0] === undefined || data[1] === undefined || data[2] === undefined || data[3] === undefined) return;
    
    //#endregion
    
    //#region Create form response object
    
    //"22.11.2020 15:00 - 16:00 (6/6), 23.11.2020 15:00 - 16:00 (6/6)"
    let test = "22.11.2020 15:00 - 16:00 (6/6), 23.11.2020 15:00 - 16:00 (6/6)";
    let sessionDateRegex = /(([0][1-9])|([12][0-9])|(3[0-1]))\.(([0][1-9])|([1][0-2]))\.([0-9]+)/;
    let sessionTimeRegex = /(([01][0-9])|(2[0-3])):(([0-5][0-9])) - (([01][0-9])|(2[0-3])):(([0-5][0-9]))/;
    
    let sessions = test.split(', ');
    let normSessions : Array<Session> = [];
    
    if(sessions == null) return;
    
    sessions.forEach(
        (value) =>
        {
            let dateResult = sessionDateRegex.exec(value);
            let timeResult = sessionTimeRegex.exec(value);
            
            if(dateResult == null || timeResult == null) return;
            
            let normSession : Session = getSession(dateResult[0], timeResult[0]);
            
            normSessions.push(normSession);
        }
    )
    
    let reservation : Reservation = 
    {
        timestamp : data[0],
        name : data[1],
        surname : data[2],
        sessions : normSessions,
        emailAdress : data[4]
    };
    
    //#endregion
    
    //#region Process the form response.
    
    processFormResponse(reservation); // Add the form response to the reservations sheet.
    updateForm(); // Update the form.
    if(reservation.emailAdress != "") sendConfirmationEmail(reservation); // Send a confirmation e-mail if the user specified it.
    
    //#endregion
}

/**
 * Process form response and add it to reservations sheet.
 * @param {Reservation} formResponse Form object.
 */
function processFormResponse(formResponse : Reservation)
{
    //#region Reservation sheet variables
    
    if(!formResponse) return;

    let reservationSheet = getReservationSheet(); 
    if(reservationSheet == null) return;
    
    let lastColumn = reservationSheet.getLastColumn();
    let lastRow = reservationSheet.getLastRow();

    //#endregion
    
    //#region Copy and paste the template
    
    const reservationTemplateCells = reservationSheet.getRange(2, 1, 1, lastColumn); // Select reservation template cells to copy (second row in reservations sheet)
    const emptyRows = reservationSheet.getRange(lastRow + 1, 1, formResponse.sessions.length, lastColumn); // Last row of reservations sheet + rows after that based on number of reservations made

    reservationTemplateCells.copyTo(emptyRows);
    
    //#endregion
    
    //#region Loop through reservations and fill the copy pasted template with each reservation
    
    // Prepare reservations data in 2D array to set into sheet
    let reservations = [];
    for(var index = 0; index < formResponse.sessions.length; index++)
    {
        reservations[index] = 
        [
            formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessions[index], formResponse.emailAdress, 'FALSE'
        ];
    }

    emptyRows.setValues(reservations);
    
    //#endregion

    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

/**
 * Update form, more specifically free sessions with the current state.
 */
function updateForm()
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
        
        if(session.text == undefined || session.capacity == undefined || session.free == undefined || session.reserved == undefined) return;
        
        if(session.free > 0 && session.capacity > 0 && (currentDate.getTime() <= session.start.getTime())) // If there is free space and tha capacity isn't 0 and the session hasn't already started
        {
            let checkboxChoice = `${session.text?.date} ${session.text?.time.start} - ${session.text?.time.end} (${session.free}/${session.capacity})`;
            newFreeSessions.push(checkboxChoice);
        }
    }
    
    //#endregion
    
    //#region Update checkbox choices with new free sessions
    
    if(newFreeSessions.length == 0) newFreeSessions.push("Nie sú žiadne voľné termíny.");
    if(newFreeSessions.length > 0) freeSessionCheckboxes.setChoiceValues(newFreeSessions);
    
    //#endregion
}

/**
 * Sends a confirmation e-mail about the reservation to the customer.
 * @param {Reservation} formResponse Normalized form response from a user in object.
 */
function sendConfirmationEmail(formResponse : Reservation)
{
    //#region Process form data and prepare it for injecting it in e-mail template
    
    let sessionDays = [], sessionDates = [], sessionTimes = [];
    
    for(var index = 0; index < formResponse.sessions.length; index++)
    {
        sessionDays.push(getDayOfWeekString(getEuropeDay(formResponse.sessions[index].start)));
        // sessionDates.push(getSessionDate(session).text);
        // sessionTimes.push(getSessionTime(session).text);
    }
    
    //#endregion

    let htmlBody = getEmailBodyReservations(formResponse.name, formResponse.surname, formResponse.sessions, sessionDays); // Get HTML content
    
    //#region Prepare e-mail object and send it
    
    let mail = 
    {
        name: "Fitness centrum Cardio Sport", // Name shown as an author of the e-mail
        to: formResponse.emailAdress, // Recipient from form
        subject: "Potvrdenie rezervácie termínu vstupu do Fitness centra Cardio Sport",
        htmlBody: htmlBody
    };
    
    MailApp.sendEmail(mail);
    
    //#endregion
}