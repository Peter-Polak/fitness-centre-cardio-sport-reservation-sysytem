// --------------------------------
// Scripts for Reservations sheet.
// --------------------------------

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
            reservationSheet.hideRows(ReservationsSheet.startingRow + reservationIndex);
        }
    }
    
    //#endregion
}

/**
 * Gets all reservations from Reservations sheet.
 * @return {Array<Reservation>} All reservations in an array.
 */
function getAllReservations() : Array<Reservation>
{
    const reservationSheet = getReservationSheet();
    if(reservationSheet == null) return [];
    
    const lastRow = reservationSheet.getLastRow();
    const numOfRows = lastRow - ReservationsSheet.startingRow - 1;
    const reservationRows = reservationSheet.getRange(ReservationsSheet.startingRow, 1, numOfRows, ReservationsSheet.numberOfColumns).getValues();
    
    //#endregion
    
    //#region Loop through all rows in reservations sheet
    
    let reservations = [];
    
    for(let row = 0; row < reservationRows.length; row++)
    {
        let reservationRow = reservationRows[row];
        
        const timestamp = reservationRow[ReservationsSheet.columns.Timestamp - 1];
        const name = reservationRow[ReservationsSheet.columns.Name - 1];
        const surname = reservationRow[ReservationsSheet.columns.Surname - 1];
        const sessionString = reservationRow[ReservationsSheet.columns.Session - 1];
        const emailAddress = reservationRow[ReservationsSheet.columns.EmailAddress - 1];
        const wasCancelled = reservationRow[ReservationsSheet.columns.WasCancelled - 1];
        const wasntPresent = reservationRow[ReservationsSheet.columns.WasntPresent - 1];
        
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
    
    let reservationRow = 
    [
        reservation.timestamp, reservation.name, reservation.surname, reservation.session.getDateTimeString, reservation.emailAddress, 'FALSE',  'FALSE'
    ]; 
    reservationSheet.appendRow(reservationRow);
        
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
 * Copies template reservation, pastes it and sets tha values of it with actual reservation values.
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

function getReservationsByEmail(emailAddress : string) : Array<Reservation>
{
    const allReservations = getAllReservations();
    const filteredreservations = allReservations.filter(reservation => reservation.emailAddress == emailAddress);
    
    return filteredreservations;
}

function getReservationsByToken(token : string) : Array<Reservation>
{
    const user = getUserByToken(token);
    if(user == null) return [];
    
    const reservations = getReservationsByEmail(user.emailAddress);
    
    return reservations;
}