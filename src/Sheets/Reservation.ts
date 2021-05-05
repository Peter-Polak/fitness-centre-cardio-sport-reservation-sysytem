/**
 * Scripts for Reservations sheet.
 */

 class Reservation
 {
     timestamp : string;
     name : string;
     surname: string;
     sessions : Array<Session>;
     emailAdress : string;
     sessionStrings : Array<string>
     
     constructor(timestamp : string, name : string, surname: string, sessions : Array<Session> | string, emailAdress : string)
     {
         this.timestamp = timestamp;
         this.name = name;
         this.surname = surname;
         this.emailAdress = emailAdress;
         this.sessions = [];
         
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
    
    /*
    const lastRow = reservationSheet.getLastRow();
    const numOfFrozenRows = 3;
    const sessionColumn = 4; 
    
    const startingRow = lastRow - 100 > numOfFrozenRows ? lastRow - 100 : 1 + numOfFrozenRows;
    const numOfRows = startingRow > 1 + numOfFrozenRows ? 100 : lastRow - numOfFrozenRows;
    const data = reservationSheet.getRange(startingRow, sessionColumn, numOfRows).getValues();
    */
   
    const startingRow = 0;
    const data = reservationSheet.getDataRange().getValues();
    
    const now = new Date();
    const nowTime = now.getTime()
    
    //#endregion
    
    //#region Loop through all rows in reservations sheet and hide all reservations for old sessions
    
    for(let row = 0; row < data.length; row++)
    {
        let session = getSessionFromSheet(data, row);
        
        if(session == undefined)
        {
            reservationSheet.hideRows(startingRow + row);
            continue;
        }
        
        if(nowTime > session.endDate.getTime())
        {
            reservationSheet.hideRows(startingRow + row);
        }
    }
    
    //#endregion
}

function getMockupReservation(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", sessions : Array<Session> = getMockupSessions(), emailAdress : string = "peter.polak.mail@gmail.com")
{
    return  new Reservation(timestamp, name, surname, sessions, emailAdress)
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