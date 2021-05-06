/**
 * Scripts for Reservations sheet.
 */

 const numOfFrozenRows = 3;
 const sessionColumn = 4; 
 
 class Reservation
 {
     timestamp : string;
     name : string;
     surname: string;
     sessions : Array<Session>;
     emailAdress : string;
     wasCancelled : boolean;
     wasntPresent : boolean;
     sessionStrings : Array<string>
     
     constructor(timestamp : string, name : string, surname: string, sessions : Array<Session> | string, emailAdress : string, wasCancelled : boolean = false, wasntPresent : boolean = false)
     {
         this.timestamp = timestamp;
         this.name = name;
         this.surname = surname;
         this.emailAdress = emailAdress;
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

function getMockupReservation(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", sessions : Array<Session> = getMockupSessions(), emailAdress : string = "peter.polak.mail@gmail.com")
{
    return  new Reservation(timestamp, name, surname, sessions, emailAdress)
}

// let testReservation = new Reservation("01.01.2021 00:00:00", "op", "op", [new Session(new Date(2021, 4, 2, 18, 0, 0), new Date(2021, 4, 2, 20, 0, 0))], "")

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
        const wasCancelled = reservationRow[4];
        const wasntPresent = reservationRow[5];
        
        const reservation = new Reservation(timestamp, name, surname, sessionString, wasCancelled, wasntPresent);
        reservations.push(reservation);
    }
    
    //#endregion
    
    return reservations;
}