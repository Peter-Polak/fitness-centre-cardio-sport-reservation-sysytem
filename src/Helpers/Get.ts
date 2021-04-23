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

function getNumberString(number : number) : string
{
    return number < 10 ? '0' + number : '' + number;
}

function getDateString(date : Date)
{
    let day = `${getNumberString(date.getDate())}`;
    let month = `${getNumberString(date.getMonth())}`;
    let year = `${date.getFullYear()}`;
    
    return `${day}.${month}.${year}`;
}

//#endregion