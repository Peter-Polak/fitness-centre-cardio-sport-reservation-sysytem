/**
 * Scripts for Session sheet.
 */


/**
 * Adds new session to sessions sheet.
 * @param {Date} date Date of new the new session.
 * @param {string} time Time of the new session.
 * @param {string} capacity Capacity
 */
function addNewSession(date : Date, time : string, capacity : string)
{
    //#region Session Sheet info
    
    const sessionSheet = getSessionSheet();
    if(sessionSheet == null) return;
    
    const lastRow = sessionSheet.getLastRow();
    const lastColumn = 5;
    
    //#endregion
    
    //#region Settings Sheet
    
    const settingsSheet = getSettingsSheet();
    if(settingsSheet == null) return;
    
    //#endregion
    
    //#region Copy new session template at the end of the session sheet
    
    const sourceRange = settingsSheet.getRange("A19:E19"); // Select new session template to copy paste
    const targetRange = sessionSheet.getRange(lastRow + 1, 1, 1, lastColumn);  // Select next (empty) row after last one in session sheet
    
    sourceRange.copyTo(targetRange); // Paste new session template
    
    //#endregion
    
    //#region Select new session cells
    
    const dateRange = sessionSheet.getRange(lastRow + 1, 1, 1, 1); // Select new session date cell
    const timeRange = sessionSheet.getRange(lastRow + 1, 2, 1, 1); // Select new session time cell
    const capacityRange = sessionSheet.getRange(lastRow + 1, 3, 1, 1); // Select new session capacity cell
    
    //#endregion
    
    //#region Set new session cells
    
    dateRange.setValue(date);
    timeRange.setValue(time);
    capacityRange.setValue(capacity);
    
    //#endregion
}

/**
 * Generate new sessions based on settings.
 */
function addNewSessions()
{
    //#region Sheets
    
    const sessionSheet = getSessionSheet();
    const settingsSheet = getSettingsSheet();
    if(sessionSheet == null || settingsSheet == null) return;
    //#endregion
    
    //#region Get settings from settings sheet
    
    var times = settingsSheet.getRange(4, 3, 10, 7).getValues(); // Get all possible session times for each day in week
    var days = settingsSheet.getRange("N4:T10").getValues(); // Get schedule for adding new sessions to the session table
    var capacity = settingsSheet.getRange(4, 11, 1, 1).getValues(); // Get max capacity
    if(typeof capacity !== "number") return;
    
    //#endregion
    
    //if(capacity == 0) throw new Error("Capacity is set to zero."); // Return doesn't work.
    
    //#region Get schedule object for adding new sessions 
    
    // eg. newSessionsSchedule[6] (Sunday) = nextDays : [1, 1, 0, 0, 0, 0, 0], times : ["16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]
    var newSessionsSchedule : [{ nextDays : Array<number>, times : Array<string>}] = [{ nextDays : [], times : []}];
    for(var day = 0; day < 7; day++)
    {
        newSessionsSchedule[day] = 
        {
            nextDays : days[day], // Schedule of adding new sessions on that day
            times: times.map(function(value, index) { return value[day]; }).filter(n => n) // Possible times for sessions on that day // Filter gets rid of empty strings, map tranforms colmuns in 2D array into 1D array
        }
    }
    
    //#endregion
    
    //#region Day variables
    
    let today = new Date();
    // today.setDate(today.getDate());
    let todayDay = getEuropeDay(today);
    
    //#endregion
    
    //#region Loop through the schedule and add new sessions according to the schedule
    
    for(var day = 0; day < 7; day++)
    {
        //#region If there are supposed to be added new sessions today for that day in week, add them
        
        if(newSessionsSchedule[todayDay].nextDays[day] && capacity > 0)
        {
            let daysFromToday = day - todayDay > 0 ? day - todayDay : day - todayDay + 7; // How many days from today
            let newSessiondDate = new Date(today.getVarDate());
            newSessiondDate.setDate(newSessiondDate.getDate() + daysFromToday);
            let newSessionDay = getEuropeDay(newSessiondDate); // Get day of week for the new sessions
            
            //#region Loop until all sessions that are supposed to be added today for that day in week are added
            
            let index = 0;
            while(newSessionsSchedule[newSessionDay].times[index] != "" && index < newSessionsSchedule[newSessionDay].times.length)
            {
                addNewSession(newSessiondDate, newSessionsSchedule[newSessionDay].times[index], capacity);
                index++;
            }
            
            //#endregion
        }
        
        //#endregion
    }
    
    //#endregion
    
    //#region Sort session sheet
    
    sessionSheet.sort(2, true); // Sort sheet based on time of session
    sessionSheet.sort(1, true); // Sort sheet based on date of session
    
    //#endregion
}

/**
 * Goes throug all active sessions and archives every single one that has ended already.
 */
function archiveOldSessions()
{
    //#region Sheets
    
    const sessionSheet = getSessionSheet();
    const archiveSheet = getArchiveSheet();
    if(sessionSheet == null || archiveSheet == null) return;
    
    //#endregion
    
    //#region Variables
    
    let cells = sessionSheet.getDataRange().getValues(); // Value of all cells in session sheet
    let rowCount = Object.keys(cells).length; // Number of rows in session sheet
    let numOfArchivedRows = 0; // Row index offset, needed if previous row got deleted and current row is now one row higher
    
    //#endregion
    
    //#region Loop through all session rows (skip first 4 rows because they are headers) and archive all old sessions
    
    //  for(var n = rowCount - 1; n >= 4; n--)
    for(var n = 4; n < rowCount; n++)
    {
        let currentDate = new Date(); // Used for comparison if the session is older than right now
        
        let session = getSession(cells, n);
        // Set date object to session end hours and minutes (neede only for comparison with current date object)
        session.date.original.setHours(session.time.end.hours);
        session.date.original.setMinutes(session.time.end.minutes);
        session.date.original.setSeconds(0);
        
        //#region If the session has already finished, archive it
        
        if(currentDate.getTime() >= session.date.original.getTime())
        {
            let archiveLastRow = archiveSheet.getLastRow();
            let rowToArchive = n - numOfArchivedRows + 1; // 1 is for index offset
            
            let sessionRowToArchive = sessionSheet.getRange(rowToArchive, 1, 1, sessionSheet.getLastColumn()); // Select finished session to archive from session sheet
            let emptyRowInArchive = archiveSheet.getRange(archiveLastRow + 1, 1, 1, archiveSheet.getLastColumn()); // Select next (empty) row after last one in archive sheet
            
            sessionRowToArchive.copyTo(emptyRowInArchive); // Copy old session to archive sheet
            sessionSheet.deleteRow(rowToArchive); // Delete archived session from session sheet
            numOfArchivedRows++;
        }
        
        //#endregion
    }
    
    //#endregion
    
    //#region Sort archive sheet
    
    archiveSheet.sort(2, true); // Sort sheet based on time of session
    archiveSheet.sort(1, true); // Sort sheet based on date of session
    
    //#endregion
}