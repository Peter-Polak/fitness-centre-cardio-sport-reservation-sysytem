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
    
    let reservation : Reservation = new Reservation(
        data[0], 
        data[1],
        data[2],
        data[3],
        data[4]
    );
    
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
            formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessionStrings[index], formResponse.emailAdress, 'FALSE',  'FALSE'
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

/**
 * Sends a confirmation e-mail about the reservation to the customer.
 * @param {Reservation} formResponse Normalized form response from a user in object.
 */
function sendConfirmationEmail(formResponse : Reservation)
{
    let htmlBody = getEmailBodyReservations(formResponse); // Get HTML content
    
    //#region Prepare e-mail object and send it
    
    let mail = 
    {
        name: "Fitness centrum Cardio Sport", // Name shown as an author of the e-mail
        to: formResponse.emailAdress, // Recipient from form
        subject: getEmailSubject(formResponse.sessions),
        htmlBody: htmlBody
    };
    
    MailApp.sendEmail(mail);
    
    //#endregion
}

/**
 * Gets called when user opens web app page.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML page to show to the user of the web app.
 */
function doGet()
{
    const sessions = getAllSessionsFromSheet();
    const organizedSessions = organizeSessions(sessions);
    
    let htmlTemplate = HtmlService.createTemplateFromFile("form");
    
    htmlTemplate.sessions = organizedSessions;
    
    let htmlOutput =  htmlTemplate.evaluate();
    htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    return htmlOutput;
}

function onHtmlFormSubmit(formResponse : FormResponse)
{
    //#region Create form response object
    
    let reservation : Reservation = new Reservation(formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessions, formResponse.email);
    
    //#endregion
    
    //#region Process the form response.
    
    processReservation(reservation); // Add the form response to the reservations sheet.
    updateForm(); // Update the form.
    if(reservation.emailAdress != "") sendConfirmationEmail(reservation); // Send a confirmation e-mail if the user specified it.
    
    //#endregion
    
    return JSON.stringify(reservation);
}

function processReservation(reservation : Reservation)
{
    //#region Reservation sheet variables
    
    let reservationSheet = getReservationSheet(); 
    if(reservationSheet == undefined) return;
    
    //#endregion
    
    //#region Check reservation validity
    
    let reservationValidity = isReservationValid(reservation);
    if(!reservationValidity.isValid) throw Error(JSON.stringify(reservationValidity));
    
    //#endregion
    
    //#region Loop through reservations and fill the copy pasted template with each reservation
    
    // Prepare reservation sessions data in 2D array to set into sheet
    for(var index = 0; index < reservation.sessions.length; index++)
    {
        let reservationRow = 
        [
            reservation.timestamp, reservation.name, reservation.surname, reservation.sessionStrings[index], reservation.emailAdress, 'FALSE',  'FALSE'
        ];
        
        reservationSheet.appendRow(reservationRow);
    }

    //#endregion

    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

function include(htmlFileName : string)
{
    return HtmlService.createHtmlOutputFromFile(htmlFileName).getContent();
}

function isReservationValid(reservation : Reservation) : ReservationValidity
{
    let result : ReservationValidity = { isValid : true, reasons: []};
    
    let sessionSheet = getSessionSheet(); 
    if(sessionSheet == undefined) return { isValid: false, reasons : []};
    
    let sessions = getAllSessionsFromSheet();
    if(sessions.length == 0)
    {
        result.isValid = false;
        reservation.sessions.forEach(
            session => 
            {
                result.reasons.push({ session: session, error: SessionError.DOES_NOT_EXIST })
            }
        );
    };
    
    for (let reservationIndex = 0; reservationIndex < reservation.sessions.length; reservationIndex++)
    {
        const reservationSession = reservation.sessions[reservationIndex];
        
        let wasFound = false;
        for (let sessionsIndex = 0; sessionsIndex < sessions.length; sessionsIndex++)
        {
            const session = sessions[sessionsIndex];
                
            if(session.startDate.getTime() == reservationSession.startDate.getTime())
            {
                wasFound = true;
                
                if(session.getFreeSpaces <= 0)
                {
                    result.isValid = false;
                    result.reasons.push({ session: reservationSession, error: SessionError.IS_FULL })
                }
                break;
            }
        }
        
        if(!wasFound)
        {
            result.isValid = false;
            result.reasons.push({ session: reservationSession, error: SessionError.DOES_NOT_EXIST })
        }
    }
    
    return result;
}