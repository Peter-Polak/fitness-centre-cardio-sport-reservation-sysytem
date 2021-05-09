/**
 * Scripts for Reservations sheet.
 */

 const numOfFrozenRows = 3;
 const sessionColumn = 4; 
 
 enum SessionError
{
    DOES_NOT_EXIST = "DOESNT_EXIST",
    IS_FULL = "FULL",
    RESERVATION_EXISTS = "RESERVATION_EXISTS"
}
 
 class Reservation
 {
     timestamp : string;
     name : string;
     surname: string;
     sessions : Array<Session>;
     emailAddress : string;
     wasCancelled : boolean;
     wasntPresent : boolean;
     sessionStrings : Array<string>
     
     constructor(timestamp : string, name : string, surname: string, sessions : Array<Session> | string, emailAdress : string, wasCancelled : boolean = false, wasntPresent : boolean = false)
     {
         this.timestamp = timestamp;
         this.name = name;
         this.surname = surname;
         this.emailAddress = emailAdress;
         this.sessions = [];
         this.wasCancelled = wasCancelled;
         this.wasntPresent = wasntPresent;
         
         if(typeof sessions == "string")
         {
            this.sessionStrings = sessions.split(', ');
            
            this.sessionStrings.forEach(
                (sessionString) =>
                {
                    let sessionDates = Session.getDatesFromString(sessionString);
                    if(sessionDates == undefined) return;
                    
                    let session = new Session(sessionDates.start, sessionDates.end)
                    this.sessions.push(session);
                }
             )
         }
         else
         {
             this.sessions = sessions;
             this.sessionStrings = [];
         } 
     }
 }

/**
 * Hides all rows with old reservations in it.
 */
function hideOldReservations()
{
    //#region Reservation sheet variables
    
    const reservationSheet = getReservationSheet();
    if(reservationSheet == null) return;
    
    const reservations = getAllReservations();
    const now = new Date();
    const nowTime = now.getTime()
    
    //#endregion
    
    //#region Loop through all rows in reservations sheet and hide all reservations for old sessions
    
    for(let reservationIndex = 0; reservationIndex < reservations.length; reservationIndex++)
    {
        const reservation = reservations[reservationIndex];
        if(reservation.sessions.length == 0 || nowTime > reservation.sessions[0].endDate.getTime())
        {
            reservationSheet.hideRows(numOfFrozenRows + reservationIndex + 1);
        }
    }
    
    //#endregion
}

/**
 * Get resrvation object with mockup data.
 * @param timestamp Timestamp of reservation.
 * @param name Customer's name.
 * @param surname Customer's surname.
 * @param sessions Sessions to reserve.
 * @param emailAddress Custome's e-mail address.
 */
function getMockupReservation(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", sessions : Array<Session> = getMockupSessions(), emailAddress : string = "peter.polak.mail@gmail.com")
{
    return  new Reservation(timestamp, name, surname, sessions, emailAddress)
}

/**
 * Checks if the reservation is valid (if session isn't full, exists and reservation doesn't already exist).
 * @param {Reservation} reservation Reservation to validate.
 * @returns {ReservationValidity} Reservation validity object.
 */
function isReservationValid(reservation : Reservation) : ReservationValidity
{
    let result : ReservationValidity = { isValid : true, reasons: {}};
    
    const sessions = getAllSessionsFromSheet();
    const reservations = getAllReservations();
    
    if(sessions.length == 0)
    {
        result.isValid = false;
        reservation.sessions.forEach(
            session => 
            {
                result.reasons[session.getDateTimeString] = { session: session, error: SessionError.DOES_NOT_EXIST };
            }
        );
        
        return result;
    };
    
    reservationLoop:
    for (let reservationIndex = 0; reservationIndex < reservation.sessions.length; reservationIndex++)
    {
        const reservationSession = reservation.sessions[reservationIndex];
        
        for (let reservationsIndex = 0; reservationsIndex < reservations.length; reservationsIndex++)
        {
            const currentReservation = reservations[reservationsIndex];

            if(
                currentReservation.name == reservation.name 
                && currentReservation.surname == reservation.surname 
                && currentReservation.sessions[0].startDate.getTime() == reservationSession.startDate.getTime() 
                && currentReservation.sessions[0].endDate.getTime() == reservationSession.endDate.getTime()
            )
            {
                result.isValid = false;
                result.reasons[reservationSession.getDateTimeString] = { session: reservationSession, error: SessionError.RESERVATION_EXISTS };
                
                continue reservationLoop;
            }
        }
        
        for (let sessionsIndex = 0; sessionsIndex < sessions.length; sessionsIndex++)
        {
            const session = sessions[sessionsIndex];
                
            if(session.startDate.getTime() == reservationSession.startDate.getTime())
            {
                if(session.getFreeSpaces <= 0)
                {
                    result.isValid = false;
                    result.reasons[reservationSession.getDateTimeString] = { session: reservationSession, error: SessionError.IS_FULL };
                }
                continue reservationLoop;
            }
        }
        
        result.isValid = false;
        result.reasons[reservationSession.getDateTimeString] = { session: reservationSession, error: SessionError.DOES_NOT_EXIST };
    }
    
    return result;
}

/**
 * Gets all reservations from Reservations sheet.
 * @return {Array<Reservation>} All reseravtions in an array.
 */
function getAllReservations() : Array<Reservation>
{
    const reservationSheet = getReservationSheet();
    if(reservationSheet == null) return [];
    
    const startingRow = numOfFrozenRows;
    const lastRow = reservationSheet.getLastRow();
    const numOfRows = lastRow - numOfFrozenRows;
    const reservationRows = reservationSheet.getRange(startingRow + 1, 1, numOfRows, 7).getValues();
    
    //#endregion
    
    //#region Loop through all rows in reservations sheet
    
    let reservations = [];
    
    for(let row = 0; row < reservationRows.length; row++)
    {
        let reservationRow = reservationRows[row];
        
        const timestamp = reservationRow[0];
        const name = reservationRow[1];
        const surname = reservationRow[2];
        const sessionString = reservationRow[3];
        const emailAddress = reservationRow[4];
        const wasCancelled = reservationRow[5];
        const wasntPresent = reservationRow[6];
        
        const reservation = new Reservation(timestamp, name, surname, sessionString, emailAddress, wasCancelled, wasntPresent);
        reservations.push(reservation);
    }
    
    //#endregion
    
    return reservations;
}

/**
 * 
 * @param {Reservation} reservation Reservation to process.
 */
function appendReservation(reservation : Reservation)
{
    let reservationSheet = getReservationSheet();
    if(reservationSheet == null) return;
    
    //#region Loop through reservations and append each session reservation
    
    for(var index = 0; index < reservation.sessions.length; index++)
    {
        let reservationRow = 
        [
            reservation.timestamp, reservation.name, reservation.surname, reservation.sessionStrings[index], reservation.emailAddress, 'FALSE',  'FALSE'
        ];
        
        reservationSheet.appendRow(reservationRow);
    }
    
    //#endregion
    
    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

/**
 * Copies template resrvation, pastes it and sets tha values of it with actual reservation values.
 * @param {Reservation} reservation Reservation to process.
 */
function addReservation(reservation : Reservation)
{
    //#region Variables
    
    let reservationSheet = getReservationSheet();
    if(reservationSheet == null) return;
    
    const lastColumn = reservationSheet.getLastColumn();
    const lastRow = reservationSheet.getLastRow();
    
    const reservationTemplateCells = reservationSheet.getRange(2, 1, 1, lastColumn); // Select reservation template cells to copy (second row in reservations sheet)
    const emptyRows = reservationSheet.getRange(lastRow + 1, 1, reservation.sessions.length, lastColumn); // Last row of reservations sheet + rows after that based on number of reservations made

    reservationTemplateCells.copyTo(emptyRows);
    
    //#endregion
    
    //#region Loop through reservations and fill the copy pasted template with each reservation
    
    let reservations = [];
    
    // Prepare reservation sessions data in 2D array to set into sheet
    for(var index = 0; index < reservation.sessions.length; index++)
    {
        let reservationRow = 
        [
            reservation.timestamp, reservation.name, reservation.surname, reservation.sessionStrings[index], reservation.emailAddress, 'FALSE',  'FALSE'
        ];
        
        reservations.push(reservationRow);
    }
    
    emptyRows.setValues(reservations);
    
    //#endregion
    
    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

function getReservationsByEmail(emailAddress : string = "peter.polak.mail@gmail.com")
{
    const allReservations = getAllReservations();
    const filteredreservations = allReservations.filter(reservation => reservation.emailAddress == emailAddress);
    
    return filteredreservations;
}

/**
 * Process new reservation. Check if it is valid and if it is append it to the reservations sheet.
 * @param reservation Reservation to process.
 */
function processReservation(reservation : Reservation)
{
    //#region Check reservation validity
    
    let reservationValidity = isReservationValid(reservation);
    if(!reservationValidity.isValid)
    {
        let response = 
        {
            reservation : reservation,
            validity : reservationValidity
        };
        
        throw Error(JSON.stringify(response));
    }
    
    //#endregion
    
    appendReservation(reservation);
}