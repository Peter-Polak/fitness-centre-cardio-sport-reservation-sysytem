/**
 * Scripts for form handling.
 */

class ReservationForm
{
    timestamp : string;
    name : string;
    surname : string;
    emailAddress : string;
    sessionsString : string ;
    
    reservations : Array<Reservation>;
    
    constructor(timestamp : string, name : string, surname : string, emailAddress : string, sessionsString : string)
    {
        this.timestamp = timestamp;
        this.name = name;
        this.surname = surname;
        this.emailAddress = emailAddress;
        this.sessionsString = sessionsString;
        
        this.reservations = [];
        
        let sessionStrings = this.sessionsString.split(", ");
        
        for(const sessionString of sessionStrings)
        {
            const dates = Session.getDatesFromString(sessionString);
            if(dates === undefined) continue;
            
            const session = new Session(dates.start, dates.end);
            const reservation = new Reservation(this.timestamp, this.name, this.surname, session, this.emailAddress);
            this.reservations.push(reservation);
        }
    }
}

/**
 * Even handler for event on form submit.
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

function processWebAppReservationForm(reservationForm : ReservationForm)
{
    appendReservationForm(reservationForm);
    
    let reservationValidity = checkReservationFormValidity(reservationForm);
    if(!reservationValidity.isValid) return reservationValidity;
    
    processReservationForm(reservationForm);
    
    return reservationValidity;
}

function processReservationForm(reservationForm : ReservationForm)
{
    appendReservations(reservationForm.reservations);
    updateGoogleForm();
    if(reservationForm.emailAddress != "" && reservationForm.emailAddress) sendConfirmationEmail(reservationForm); // Send a confirmation e-mail if the user specified it.
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

function appendReservationForm(reservationForm : ReservationForm)
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

function checkReservationFormValidity(reservationForm : ReservationForm)
{
    let reservationFormValidity : ReservationFormValidity = 
    {
        object : reservationForm,
        isValid : true,
        reasons : []
    };
    
    const { name, surname, emailAddress, reservations } = reservationForm;
    
    const nameValidity = checkTextFieldValidity("name", name, true);
    const surnameValidity = checkTextFieldValidity("surname", surname, true);
    const reservationValidities = checkReservationsValid(reservations);
    
    if(!nameValidity.isValid)
    {
        reservationFormValidity.isValid = false;
        reservationFormValidity.reasons.push(nameValidity)
    };
    
    if(!surnameValidity.isValid)
    {
        reservationFormValidity.isValid = false;
        reservationFormValidity.reasons.push(surnameValidity);
    }
    
    if(reservationValidities.length > 0)
    {
        reservationFormValidity.isValid = false;
        reservationFormValidity.reasons.push(...reservationValidities);
    }
    
    return reservationFormValidity;
}

function checkTextFieldValidity(name : string, value : string, isRequired : boolean, pattern? : RegExp)
{
    let textFieldValidity : TextFieldValidity= 
    { 
        object: 
        {
            name : name,
            value : value
        }, 
        isValid : true,
        reasons : []
    }
    
    if(isRequired && (value === null || value === undefined || value === ""))
    {
        let reason : TextFieldReason = 
        {
            value : value,
            error : TextFieldError.IS_REQUIRED
        }
        
        textFieldValidity.isValid = false;
        textFieldValidity.reasons.push(reason);
    }
    
    return textFieldValidity;
}

function getMockupReservationForm(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", sessions : string = "24.12.2021 10:00 - 12:00", emailAddress : string = "peter.polak.mail@gmail.com")
{
    return new ReservationForm(timestamp, name, surname, emailAddress, sessions);
}