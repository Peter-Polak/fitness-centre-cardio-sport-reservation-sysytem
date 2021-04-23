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
    
    const lastRow = reservationSheet.getLastRow();
    
    const numOfFrozenRows = 3;
    const sessionColumn = 4;
    const startingRow = lastRow - 100 > numOfFrozenRows ? lastRow - 100 : 1 + numOfFrozenRows;
    const numOfRows = startingRow > 1 + numOfFrozenRows ? 100 : lastRow - numOfFrozenRows;
    const data = reservationSheet.getRange(startingRow, sessionColumn, numOfRows).getValues();
    // let data = reservationSheet.getDataRange().getValues();
    
    const now = new Date();
    const nowTime = now.getTime()
    
    //#endregion
    
    //#region Loop through all rows in reservations sheet and hide all reservations for old sessions
    
    for(let row = 0; row < data.length; row++)
    {
        let session = getSessionFromSheet(data, row);
        if(session == undefined) return;
        
        if(nowTime > session.endDate.getTime())
        {
            reservationSheet.hideRows(startingRow + row);
        }
    }
    
    //#endregion
}