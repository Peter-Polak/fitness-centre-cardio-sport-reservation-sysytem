// --------------------------------
// Scripts for Sessions sheet.
// --------------------------------

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
    
    //#endregion
    
    //#region Settings Sheet
    
    const settingsSheet = getSettingsSheet();
    if(settingsSheet == null) return;
    
    //#endregion
    
    //#region Copy new session template at the end of the session sheet
    
    const sourceRange = settingsSheet.getRange("A19:E19"); // Select new session template to copy paste
    const targetRange = sessionSheet.getRange(lastRow + 1, 1, 1, SessionsSheet.numberOfColumns);  // Select next (empty) row after last one in session sheet
    
    sourceRange.copyTo(targetRange); // Paste new session template
    
    //#endregion
    
    //#region Select new session cells
    
    const dateRange = sessionSheet.getRange(lastRow + 1, SessionsSheet.columns.Date, 1, 1); // Select new session date cell
    const timeRange = sessionSheet.getRange(lastRow + 1, SessionsSheet.columns.Time, 1, 1); // Select new session time cell
    const capacityRange = sessionSheet.getRange(lastRow + 1, SessionsSheet.columns.Capacity, 1, 1); // Select new session capacity cell
    
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
    // if(typeof capacity !== "number") return;
    
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
    let todayDay = getEuropeDay(today);
    
    //#endregion
    
    //#region Loop through the schedule and add new sessions according to the schedule
    
    for(var day = 0; day < 7; day++)
    {
        //#region If there are supposed to be added new sessions today for that day in week, add them
        //@ts-ignore
        if(newSessionsSchedule[todayDay].nextDays[day] && capacity > 0)
        {
            let daysFromToday = day - todayDay > 0 ? day - todayDay : day - todayDay + 7; // How many days from today
            //@ts-ignore
            let newSessiondDate = new Date(today);
            newSessiondDate.setDate(newSessiondDate.getDate() + daysFromToday);
            let newSessionDay = getEuropeDay(newSessiondDate); // Get day of week for the new sessions
            
            //#region Loop until all sessions that are supposed to be added today for that day in week are added
            
            let index = 0;
            while(newSessionsSchedule[newSessionDay].times[index] != "" && index < newSessionsSchedule[newSessionDay].times.length)
            {
                //@ts-ignore
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
 * Goes through all active sessions and archives every single one that has ended already.
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
    
    for(var rowIndex = SessionsSheet.startingRow - 1; rowIndex < rowCount; rowIndex++)
    {
        let currentDate = new Date(); // Used for comparison if the session is older than right now
        let session = getSessionFromSheet(cells, rowIndex);
        if(session == undefined) return;
        
        //#region If the session has already finished, archive it
        
        if(currentDate.getTime() >= session.endDate.getTime())
        {
            let archiveLastRow = archiveSheet.getLastRow();
            let rowToArchive = rowIndex - numOfArchivedRows + 1; // 1 is for index offset
            
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

/**
 * Get session object from the sessions sheet at specified row.
 * @param cells All cells in the sessions sheet.
 * @param index Row index.
 */
function getSessionFromSheet(cells : any, index : number) : Session | undefined
{
    let date = new Date(cells[index][SessionsSheet.columns.Date - 1]);
    let time = cells[index][SessionsSheet.columns.Time - 1];
    let capacity = cells[index][SessionsSheet.columns.Capacity - 1];
    let reserved = cells[index][SessionsSheet.columns.Reserved - 1];

    let dateString : string = "";

    if(typeof date == "string")
    {
        dateString = date;
    }
    else
    {
        dateString = getDateString(date)
    }
        
    let sessionString = `${dateString} ${time}`;
    let dates = Session.getDatesFromString(sessionString);
    if(dates == undefined) return;
        
    return new Session(dates.start, dates.end, capacity, reserved);
}

/**
 * Get all sessions from sheet in an array.
 * @returns {Array<Session>} Array of sessions.
 */
function getAllSessionsFromSheet() : Array<Session>
{
    const sessionSheet = getSessionSheet();
    if(sessionSheet == null) return [];

    let cells = sessionSheet.getDataRange().getValues();
    let sessions : Array<Session> = [];

    for (let index = 4; index < cells.length; index++)
    {
        let session = getSessionFromSheet(cells, index);
        if(session == undefined) continue;
        sessions.push(session)
    }

    return sessions;
}

/**
 * Organizes sessions based on date and free spaces and returns them as an object.
 * @param {Array<Session>} sessions Array of sessions to organize.
 * @returns {{ [key: string]: { free : Array<Session>, full : Array<Session> }} Organized sessions.
 */
function organizeSessions(sessions : Array<Session>) : OrganizedSessions
{
    let organizedSessions : OrganizedSessions = {};
    
    for (let i = 0; i < sessions.length; i++)
    {
        const session = sessions[i];
        
        if(!(session.getDateString in organizedSessions))
        {
            organizedSessions[session.getDateString] = { day: session.getStartDay , free : [], full : []}
        }
        
        
        const timeString = session.getTimeStrings;
        const sessionObject : SessionJson = session.getJson;
        
        if(session.getFreeSpaces > 0)
        {
            organizedSessions[session.getDateString]["free"].push(sessionObject);
        }
        else
        {
            organizedSessions[session.getDateString]["full"].push(sessionObject);
        }
    }
    
    return organizedSessions;
}

function getMockupSession(sessionString : string = "26.11.2020 16:30 - 18:30")
{
    const date = Session.getDatesFromString(sessionString);
    if(date != undefined) return new Session(date.start, date.end);
    
    return new Session(new Date(), new Date());
}