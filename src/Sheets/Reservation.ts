/**
 * Scripts for Reservations sheet.
 */


/**
 * Hides all rows with old reservations in it.
 */
function hideOldReservations()
{
    //#region Reservation sheet variables
    
    const reservationSheet = getReservationSheet();
    const lastRow = reservationSheet.getLastRow();
    
    const numOfFrozenRows = 3;
    const sessionColumn = 4;
    const startingRow = lastRow - 100 > numOfFrozenRows ? lastRow - 100 : 1 + numOfFrozenRows;
    const numOfRows = startingRow > 1 + numOfFrozenRows ? 100 : lastRow - numOfFrozenRows;
    const data = reservationSheet.getRange(startingRow, sessionColumn, numOfRows).getValues();
    // let data = reservationSheet.getDataRange().getValues();
    
    let session = "";
    let sessionDate;
    const now = new Date();
    const nowTime = now.getTime()
    
    //#endregion
    
    //#region Loop through all rows in reservations sheet and hide all reservations for old sessions
    
    for(let row = 0; row < data.length; row++)
    {
        session = data[row][0];
        // session = data[row][3];
        sessionDate = getSessionDates(session);
        
        if(nowTime > sessionDate.end.getTime())
        {
            reservationSheet.hideRows(startingRow + row);
        }
    }
    
    //#endregion
}