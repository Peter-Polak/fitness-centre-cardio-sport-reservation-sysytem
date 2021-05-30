/**
 * Scripts for Reservations sheet.
 */

 const numOfFrozenRows = 3;
 const sessionColumn = 4; 
 
 class Reservation implements IReservation
 {
    timestamp : string;
    name : string;
    surname: string;
    //@ts-ignore
    session : Session;
    sessionString : string;
    emailAddress : string;
    wasCancelled : boolean | undefined;
    wasntPresent : boolean | undefined;
    
    constructor(
    timestamp : string, 
    name : string, 
    surname: string, 
    session : Session | string, 
    emailAdress : string, 
    wasCancelled? : boolean, 
    wasntPresent? : boolean
    )
    {
        this.timestamp = timestamp;
        this.name = name;
        this.surname = surname;
        this.emailAddress = emailAdress;
        this.wasCancelled = wasCancelled;
        this.wasntPresent = wasntPresent;
        
        if(typeof session === "string")
        {
            this.sessionString = session;
        
            let sessionDates = Session.getDatesFromString(this.sessionString);
            if(sessionDates == undefined) return;
            
            this.session = new Session(sessionDates.start, sessionDates.end);
        }
        else
        {
            this.session = session;
            this.sessionString = session.getDateTimeString;
        } 
    }
    
    get getJson()
    {
        let json : ReservationJson = 
        {
            timestamp : this.timestamp,
            name : this.name,
            surname : this.surname,
            emailAddress : this.emailAddress,
            session : this.session.getJson,
            sessionString : this.sessionString,
            wasCancelled : this.wasCancelled,
            wasntPresent : this.wasntPresent,
        }
        
        return json;
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
        if(reservation.session === undefined || nowTime > reservation.session.endDate.getTime())
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
function getMockupReservation(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", session : Session = getMockupSession(), emailAddress : string = "peter.polak.mail@gmail.com")
{
    return new Reservation(timestamp, name, surname, session, emailAddress)
}

/**
 * Checks if the reservation is valid (if session isn't full, exists and reservation doesn't already exist).
 * @param {Reservation} reservation Reservation to validate.
 * @returns {ReservationValidity} Reservation validity object.
 */
function checkReservationValid(reservation : Reservation) : ReservationValidity
{
    let result : ReservationValidity = {
        object : reservation.getJson, 
        isValid : true, 
        reasons : []
    };
    
    const sessions = getAllSessionsFromSheet();
    const reservations = getAllReservations();
    
    if(sessions.length == 0)
    {
        let reason : ReservationReason = 
        {
            value : reservation.session.getJson,
            error : SessionError.DOES_NOT_EXIST
        };
        
        result.isValid = false;
        result.reasons.push(reason);
        
        return result;
    };
    
    for (let reservationsIndex = 0; reservationsIndex < reservations.length; reservationsIndex++)
    {
        const currentReservation = reservations[reservationsIndex];

        // If reservation already exists
        if(
            currentReservation.name == reservation.name 
            && currentReservation.surname == reservation.surname 
            && currentReservation.session.startDate.getTime() == reservation.session.startDate.getTime() 
            && currentReservation.session.endDate.getTime() == reservation.session.endDate.getTime()
        )
        {
            let reason : ReservationReason = 
            {
                value : reservation.session.getJson,
                error : ReservationError.RESERVATION_EXISTS
            };
            
            result.isValid = false;
            result.reasons.push(reason);
            
            return result;
        }
    }
    
    for (let sessionsIndex = 0; sessionsIndex < sessions.length; sessionsIndex++)
    {
        const session = sessions[sessionsIndex];
        
        // If session is valid
        if(session.startDate.getTime() == reservation.session.startDate.getTime())
        {
            // If session is full
            if(session.getFreeSpaces <= 0)
            {
                let reason : ReservationReason = 
                {
                    value : reservation.session.getJson,
                    error : SessionError.IS_FULL
                };
                
                result.isValid = false;
                result.reasons.push(reason);
            }
            
            return result;
        }
    }
    
    // If session is invalid
    let reason : ReservationReason = 
    {
        value : reservation.session.getJson,
        error : SessionError.DOES_NOT_EXIST
    };
    
    result.isValid = false;
    result.reasons.push(reason);
    
    return result;
}

function checkReservationsValid(reservations : Array<Reservation>) : Array<ReservationValidity>
{
    const sessions = getAllSessionsFromSheet();
    const existingReservations = getAllReservations();
    
    let validities : Array<ReservationValidity> = [];
    
    for(const reservation of reservations)
    {
        let validity : ReservationValidity = 
        {
            object : reservation.getJson,
            isValid : true,
            reasons : []
        }
        
        if(sessions.length == 0)
        {
            let reason : ReservationReason = 
            {
                value : reservation.session.getJson,
                error : SessionError.DOES_NOT_EXIST
            };
            
            validity.reasons.push(reason);
        };
        
        for(const existingReservation of existingReservations)
        {
            if(
                existingReservation.name == reservation.name 
                && existingReservation.surname == reservation.surname 
                && existingReservation.session.startDate.getTime() == reservation.session.startDate.getTime() 
                && existingReservation.session.endDate.getTime() == reservation.session.endDate.getTime()
            )
            {
                let reason : ReservationReason = 
                {
                    value : reservation.session.getJson,
                    error : ReservationError.RESERVATION_EXISTS
                };
                
                validity.reasons.push(reason);
                break;
            }
        }
        
        let foundSession = false;
        
        for(const session of sessions)
        {
            // If session is valid
            if(session.startDate.getTime() == reservation.session.startDate.getTime())
            {
                // If session is full
                if(session.getFreeSpaces <= 0)
                {
                    let reason : ReservationReason = 
                    {
                        value : reservation.session.getJson,
                        error : SessionError.IS_FULL
                    };
                    
                    validity.reasons.push(reason);
                }
                
                foundSession = true;
                break;
            }
        }
        
        if(!foundSession)
        {
            let reason : ReservationReason = 
            {
                value : reservation.session.getJson,
                error : SessionError.DOES_NOT_EXIST
            };
            
            validity.reasons.push(reason);
        }
        
        if(validity.reasons.length > 0) 
        {
            validity.isValid = false;
            validities.push(validity);
        }
    }
    
    return validities;
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
    
    //#region
    
    let reservationRow = 
    [
        reservation.timestamp, reservation.name, reservation.surname, reservation.session.getDateTimeString, reservation.emailAddress, 'FALSE',  'FALSE'
    ];
        
    reservationSheet.appendRow(reservationRow);
    
    //#endregion
        
    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

function appendReservations(reservations : Array<Reservation>)
{
    let reservationSheet = getReservationSheet();
    if(reservationSheet == null) return;
    
    //#region Loop through reservations and append each session reservation
    
    for(const reservation of reservations)
    {
        let reservationRow = 
        [
            reservation.timestamp, 
            reservation.name, 
            reservation.surname, 
            reservation.session.getDateTimeString, 
            reservation.emailAddress, 
            'FALSE',  
            'FALSE'
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
    const emptyRows = reservationSheet.getRange(lastRow + 1, 1, 1, lastColumn); // Last row of reservations sheet + rows after that based on number of reservations made

    reservationTemplateCells.copyTo(emptyRows);
    
    //#endregion

    let reservationRow = 
    [[
        reservation.timestamp, 
        reservation.name, 
        reservation.surname, 
        reservation.session.getDateTimeString, 
        reservation.emailAddress, 
        'FALSE',  
        'FALSE'
    ]];
    
    emptyRows.setValues(reservationRow);
    
    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

function getReservationsByEmail(emailAddress : string)
{
    const allReservations = getAllReservations();
    const filteredreservations = allReservations.filter(reservation => reservation.emailAddress == emailAddress);
    
    return filteredreservations;
}

function getReservationsByToken(token : string)
{
    const user = getUserByToken(token);
    if(user == null) return [];
    
    const reservations = getReservationsByEmail(user.emailAddress);
    
    return reservations;
}