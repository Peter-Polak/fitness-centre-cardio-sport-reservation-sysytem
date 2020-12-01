function addNewSession(date, time, capacity)
{
    // Session Sheet
    const sessionSheet = getSessionSheet();
    const lastRow = sessionSheet.getDataRange().getLastRow();
    const lastColumn = 5;
    
    // Settings Sheet
    const settingsSheet = getSettingsSheet();
    
    const sourceRange = settingsSheet.getRange("A19:E19"); // Template session to copy
    const targetRange = sessionSheet.getRange(lastRow + 1, 1, 1, lastColumn);  // Next (empty) row after last one
    
    sourceRange.copyTo(targetRange);
    
    const dateRange = sessionSheet.getRange(lastRow + 1, 1, 1, 1);
    const timeRange = sessionSheet.getRange(lastRow + 1, 2, 1, 1);
    const capacityRange = sessionSheet.getRange(lastRow + 1, 3, 1, 1);
    
    dateRange.setValue(date);
    timeRange.setValue(time);
    capacityRange.setValue(capacity);
}

function addNewSessions()
{
    // Sheets
    const sessionSheet = getSessionSheet();
    const settingsSheet = getSettingsSheet();
    
    // Settings
    var times = settingsSheet.getRange(4, 3, 10, 7).getValues(); // Get all possible session times for each day in week
    var days = settingsSheet.getRange("N4:T10").getValues(); // Get schedule for adding new sessions to the session table
    var capacity = settingsSheet.getRange(4, 11, 1, 1).getValues(); // Get max capacity
    
    // eg. newReservationsSchedule[6] = nextDays : [1, 1, 0, 0, 0, 0, 0], times : ["16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]
    var newReservationsSchedule = {};
    for(var day = 0; day < 7; day++)
    {
        newReservationsSchedule[day] = 
        {
            nextDays : days[day], // Schedule of adding new sessions on that day
            times: times.map(function(value, index) { return value[day]; }).filter(n => n) // Possible times for sessions on that day // Filter gets rid of empty strings, map tranforms colmuns in 2D array into 1D array
        }
    }
    
    let today = new Date();
    // today.setDate(today.getDate());
    let todayDay = getEuropeDay(today);
    
    for(var day = 0; day < 7; day++)
    {
        if(newReservationsSchedule[todayDay].nextDays[day]) // If today there are supposed to be added new sessions for that day in week
        {
            let dayModifier = day - todayDay > 0 ? day - todayDay : day - todayDay + 7; // How many days from today
            let date = new Date(today);
            date.setDate(date.getDate() + dayModifier);
            let dateDay = getEuropeDay(date); // Get day of week for the new sessions
            
            let index = 0;
            while(newReservationsSchedule[dateDay].times[index] != "" && index < newReservationsSchedule[dateDay].times.length) // Go untill all sessions for that day are added
            {
                addNewSession(date, newReservationsSchedule[dateDay].times[index], capacity);
                index++;
            }
        }
    }
    
    sessionSheet.sort(2, true); // Sort sheet based on time of session
    sessionSheet.sort(1, true); // Sort sheet based on date of session
}

function archiveOldSessions()
{
    // Session Sheet
    const sessionSheet = getSessionSheet();
    let cells = sessionSheet.getDataRange().getValues();
    let rowCount = Object.keys(cells).length;
    let numOfArchivedRows = 0;
    
    const archiveSheet = getArchiveSheet();
    
    for(var n = 4; n < rowCount; n++)
    //  for(var n = rowCount - 1; n >= 4; n--)
    {
        let currentDate = new Date();
        let session = getSession(cells, n);
        
        // Set date object to session end hours and minutes (neede only for comparison with current date object)
        session.date.original.setHours(session.time.end.hours);
        session.date.original.setMinutes(session.time.end.minutes);
        session.date.original.setSeconds(0);
        
        if(currentDate.getTime() >= session.date.original.getTime()) // If the session has already finished
        {
            let archiveLastRow = archiveSheet.getLastRow();
            let rowToArchive = n - numOfArchivedRows + 1; // numOfArchivedRows is needed if previous row got deleted and current row is now one row higher, 1 is for index offset
            
            let sourceRange = sessionSheet.getRange(rowToArchive, 1, 1, sessionSheet.getLastColumn()); // Finished session to archive (copy to archive sheet and then delete from current sessions)
            let targetRange = archiveSheet.getRange(archiveLastRow + 1, 1, 1, archiveSheet.getLastColumn()); // Next (empty) row after last one in archive sheet
            
            sourceRange.copyTo(targetRange);
            sessionSheet.deleteRow(rowToArchive);
            numOfArchivedRows++;
        }
    }
    
    archiveSheet.sort(2, true); // Sort sheet based on time of session
    archiveSheet.sort(1, true); // Sort sheet based on date of session
}