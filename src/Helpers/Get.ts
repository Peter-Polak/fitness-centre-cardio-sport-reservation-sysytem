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
    let session : Session = getSession(cells[index][0], cells[index][1]);
    session.capacity = cells[index][2];
    session.reserved = cells[index][3];
    session.free = cells[index][4];
    
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
    
    let textTime = 
    {
        start:
        {
            hours : timeString.substr(0, 2),
                minutes: timeString.substr(3, 2)
        },
        end:
        {
            hours : timeString.substr(8, 2),
                minutes: timeString.substr(11, 2)
        }
    };
    
    let numberTime = 
    {
        start:
        {
            hours : parseInt(textTime.start.hours),
            minutes: parseInt(textTime.start.minutes)
        },
        end:
        {
            hours : parseInt(textTime.end.hours),
            minutes: parseInt(textTime.end.minutes)
        }
    };

    
    let startDate = new Date(date.year, date.month, date.day, numberTime.start.hours, numberTime.start.minutes, 0, 0);
    let endDate = new Date(date.year, date.month, date.day, numberTime.end.hours, numberTime.end.minutes, 0, 0);
    
    let session : Session=
    {
        text:
        {
            date : dateString,
            time : 
            {
                start: `${timeString.substr(0, 2)}:${timeString.substr(3, 2)}`,
                end: `${timeString.substr(8, 2)}:${timeString.substr(11, 2)}`,
            }
        },
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