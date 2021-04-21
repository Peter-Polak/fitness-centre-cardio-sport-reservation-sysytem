/**
 * Scripts for form handling.
 */

/**
 * Even handler for event on form submit.
 * @param formResponseEvent Form submit event arguments.
 */
function onFormSubmitInstallable(formResponseEvent)
{
    //#region Check form response structure
    
    if(formResponseEvent === undefined) return;
    
    let data = formResponseEvent.values; // Form data in array, ordered as in sheet of responses
    
    if(data[0] === undefined || data[1] === undefined || data[2] === undefined || data[3] === undefined) return;
    
    //#endregion
    
    //#region Create form response object
    
    let formResponse = 
    {
        timestamp : data[0],
        name : data[1],
        surname : data[2],
        sessions : data[3].split(', '),
        emailAdress : data[4]
    };
    
    //#endregion
    
    //#region Process the form response.
    
    processFormResponse(formResponse); // Add the form response to the reservations sheet.
    updateForm(); // Update the form.
    if(formResponse.emailAdress != "") sendConfirmationEmail(formResponse); // Send a confirmation e-mail if the user specified it.
    
    //#endregion
}

/**
 * Process form response and add it to reservations sheet.
 * @param formResponseObject Form object.
 */
function processFormResponse(formResponseObject)
{
    //#region Reservation sheet variables
    
    if(!formResponseObject) return;
    let formResponse = formResponseObject;

    let reservationSheet = getReservationSheet();
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
    if(sessionSheet === undefined) return;
    let sessionSheetCells = sessionSheet.getDataRange().getValues();
    
    //#endregion
    
    //#region Form
    
    let form = getForm();
    let freeSessionCheckboxes = form.getItems(FormApp.ItemType.CHECKBOX)[0].asCheckboxItem();
    let newFreeSessions = [];
    
    //#endregion
    
    //#region Loop through all session rows (skip first 4 rows because they are headers) and find free and active sessions
    
    for(let n = 4; n < sessionSheetCells.length; n++)
    {
        let currentDate = new Date();
        let session = getSession(sessionSheetCells, n);
        
        session.date.original.setHours(session.time.end.hours);
        session.date.original.setMinutes(session.time.end.minutes);
        session.date.original.setSeconds(0);
        
        if(session.free > 0 && session.capacity > 0 && (currentDate.getTime() <= session.date.original.getTime())) // If there is free space and tha capacity isn't 0 and the session hasn't already started
        {
            let checkboxChoice = session.date.formated + " " + session.time.text + " (" + session.free + "/" + session.capacity + ")";
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
 * @param formResponseObject Normalized form response from a user in object.
 */
function sendConfirmationEmail(formResponseObject)
{
    //#region Process form data and prepare it for injecting it in e-mail template
    
    let formResponse = formResponseObject;
    let sessionDays = [], sessionDates = [], sessionTimes = [];
    
    for(var index = 0; index < formResponse.sessions.length; index++)
    {
        let session = formResponse.sessions[index];
        formResponse.sessions[index] = session.slice(0, -5); // Remove free space and capacity from end of the string (eg. "(6/6)")
        sessionDays.push(getDayOfWeekString(getEuropeDay(getSessionDates(session).start)));
        // sessionDates.push(getSessionDate(session).text);
        // sessionTimes.push(getSessionTime(session).text);
    }
    
    //#endregion
    
    //#region Create HTMl template from file, fill it with the information from the form and get HTML content
    
    var template = HtmlService.createTemplateFromFile('form-confirmation-email'); // Create template
    
    // Fill the template with the information from the form
    template.name = formResponse.name;
    template.surname = formResponse.surname;
    template.sessions = formResponse.sessions;
    template.sessionDays = sessionDays;
    
    let htmlBody = template.evaluate().getContent(); // Evaluate template and get HTML content

    //#endregion
    
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