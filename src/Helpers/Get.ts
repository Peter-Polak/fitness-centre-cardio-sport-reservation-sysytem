/**
 * Helper scripts.
 */

/**
 * Names of all sheets.
 */
//@ts-ignore
const Sheets = 
{
    Reservations : 
    {
      Name : "Rezervácie"
    },
    Session : 
    {
      Name : "Termíny"
    },
    Settings : 
    {
      Name : "Nastavenia"
    },
    Archive : 
    {
      Name : "Archív - Termíny"
    }
};

//#region Google service getters

/**
 * Get spreadsheet associated with this script.
 */
function getSpreadsheet()
{
    return SpreadsheetApp.getActive();
}

/**
 * Get form associated with this script.
 */
function getForm()
{
    let formURL = getSpreadsheet().getFormUrl();
    if(formURL == null) return;
    
    let form = FormApp.openByUrl(formURL);
    
    return form;
}

//#endregion

//#region Sheet getters.

/**
 * Get reservations sheet.
 */
function getReservationSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Reservations.Name);
}

/**
 * Get sessions sheet.
 */
function getSessionSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Session.Name);
}

/**
 * Get settings sheet.
 */
function getSettingsSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Settings.Name);
}

/**
 * Get archive sheet.
 */
function getArchiveSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Archive.Name);
}

//#endregion

//#region Helper functions

/**
 * Get day in week that starts with Monday(change 1 -> 0) instead of Sunday (change 0 -> 6)
 * @param date Date of the day.
 */
function getEuropeDay(date : Date)
{
    return (date.getDay() + 6) % 7;
}

/**
 * Get session object from the sessions sheet at specified row.
 * @param cells All cells in the sessions sheet.
 * @param index Row index.
 */
function getSessionFromSheet(cells : any, index : number) : Session
{
    let date = 
    {
        day: cells[index][0].substr(0, 2),
        month: cells[index][0].substr(3, 2) - 1, // January = 0
        year : cells[index][0].substr(6, 4)
    }
    
    let start = 
    {
        hours : cells[index][1].substr(0, 2),
        minutes : cells[index][1].substr(3, 2)
    };
    
    let startDate = new Date(date.year, date.month, date.day, start.hours, start.minutes, 0, 0);
    
    let end = 
    {
        hours : cells[index][1].substr(8, 2),
        minutes : cells[index][1].substr(11, 2)
    };
    
    let endDate = new Date(date.year, date.month, date.day, end.hours, end.minutes, 0, 0);
    
    let capacity = cells[index][2];
    let reserved = cells[index][3];
    let free = cells[index][4];
    
    let session : Session=
    {
        start : startDate,
        end: endDate,
        capacity : capacity,
        reserved : reserved,
        free : free
    };
    
    return session;
}

function getSession(dateString : string, timeString : string) : Session
{
    let date = 
    {
        day: parseInt(dateString.substr(0, 2)),
        month: parseInt(dateString.substr(3, 2)) - 1, // January = 0
        year : parseInt(dateString.substr(6, 4))
    }
    
    let start = 
    {
        hours : parseInt(timeString.substr(0, 2)),
        minutes : parseInt(timeString.substr(3, 2))
    };
    
    let startDate = new Date(date.year, date.month, date.day, start.hours, start.minutes, 0, 0);
    
    let end = 
    {
        hours : parseInt(timeString.substr(8, 2)),
        minutes : parseInt(timeString.substr(11, 2))
    };
    
    let endDate = new Date(date.year, date.month, date.day, end.hours, end.minutes, 0, 0);
    
    let session : Session=
    {
        start : startDate,
        end: endDate
    };
    
    return session;
}

/**
 * I think this is copy-pasted code from StackOverflow.
 * @param x 
 */
function getNextDay(x : number)
{
    var now = new Date();    
    now.setDate(now.getDate() + (x+(7-now.getDay())) % 7);
  
    let dateFormated = Utilities.formatDate(now, "GMT+1", "dd.MM.yyyy");
    return dateFormated;
}

/**
 * Get string representation of the day in the week based on number index.
 * @param day Number index of the day in the week.
 */
function getDayOfWeekString(day : number)
{
    const dayOfWeek = 
    [
        "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"
    ];
    
    return dayOfWeek[day];
}

//#endregion