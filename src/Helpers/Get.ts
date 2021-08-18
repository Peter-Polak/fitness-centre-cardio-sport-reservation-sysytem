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
    Sessions : 
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
    },
    WebAppResponses : 
    {
      Name : "Odpovede - WebApp"
    },
    Users : 
    {
      Name : "Users"
    }
};

//#region Google service getters

/**
 * Get active spreadsheet associated with this script.\
 * @returns { GoogleAppsScript.Spreadsheet.Spreadsheet} Spreadsheet object.
 */
function getSpreadsheet() : GoogleAppsScript.Spreadsheet.Spreadsheet
{
    return SpreadsheetApp.getActive();
}

/**
 * Get Google Form associated with this script.
 * @returns { GoogleAppsScript.Forms.Form | null} Form object or null if not found.
 */
function getForm() : GoogleAppsScript.Forms.Form | null
{
    let formURL = getSpreadsheet().getFormUrl();
    if(formURL == null) return null;
    
    let form = FormApp.openByUrl(formURL);
    
    return form;
}

//#endregion

//#region Sheet getters.

/**
 * Get `Reservation` sheet object.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet | null} `Reservation` sheet object or null if not found.
 */
function getReservationSheet() : GoogleAppsScript.Spreadsheet.Sheet | null
{
    return getSpreadsheet().getSheetByName(Sheets.Reservations.Name);
}

/**
 * Get `Session` sheet object.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet | null} `Session` sheet object or null if not found.
 */
function getSessionSheet() : GoogleAppsScript.Spreadsheet.Sheet | null
{
    return getSpreadsheet().getSheetByName(Sheets.Sessions.Name);
}

/**
 * Get `Settings` sheet object.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet | null} `Settings` sheet object or null if not found.
 */
function getSettingsSheet() : GoogleAppsScript.Spreadsheet.Sheet | null
{
    return getSpreadsheet().getSheetByName(Sheets.Settings.Name);
}

/**
 * Get `Archive` sheet object.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet | null} `Archive` sheet object or null if not found.
 */
function getArchiveSheet() : GoogleAppsScript.Spreadsheet.Sheet | null
{
    return getSpreadsheet().getSheetByName(Sheets.Archive.Name);
}

/**
 * Get `Web App Responses` sheet object.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet | null} `Web App Responses` sheet object or null if not found.
 */
 function getWebAppResponsesSheet() : GoogleAppsScript.Spreadsheet.Sheet | null
 {
     return getSpreadsheet().getSheetByName(Sheets.WebAppResponses.Name);
 }
 
/**
 * Get `Users` sheet object.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet | null} `Users` sheet object or null if not found.
 */
  function getUsersSheet() : GoogleAppsScript.Spreadsheet.Sheet | null
  {
      return getSpreadsheet().getSheetByName(Sheets.Users.Name);
  }

//#endregion

//#region Helper functions

/**
 * Get day in week that starts with Monday(change 1 -> 0) instead of Sunday (change 0 -> 6)
 * @param date Date of the day.
 * @returns Index of the day in week starting with monday. ex. 0 -> Monday, ..., 6 -> Sunday
 */
function getEuropeDay(date : Date) : number
{
    return (date.getDay() + 6) % 7;
}

/**
 * Get a string representation of the day in the week based on number index.
 * @param day Number index of the day in the week.
 * @returns String representation of the day in the week.
 */
function getDayOfWeekString(day : number) : string
{
    const dayOfWeek = 
    [
        "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"
    ];
    
    return dayOfWeek[day];
}

/**
 * Get a string representation of a number.
 * @param number Number to convert.
 * @returns String representation of number.
 */
function getNumberString(number : number) : string
{
    return number < 10 ? '0' + number : '' + number;
}

/**
 * Get a string representation of a date in the format `dd.mm.yyyy`.
 * @param date Date to convert.
 * @returns String representation of date.
 */
function getDateString(date : Date) : string
{
    let day = `${getNumberString(date.getDate())}`;
    let month = `${getNumberString(date.getMonth() + 1)}`;
    let year = `${date.getFullYear()}`;
    
    return `${day}.${month}.${year}`;
}

/**
 * Get a string representation of time in the format `hh:mm:ss`.
 * @param date Date object to convert.
 * @returns String representation of time.
 */
function getTimeString(date : Date) : string
{
    let hours = `${getNumberString(date.getHours())}`;
    let minutes = `${getNumberString(date.getMinutes())}`;
    let seconds = `${getNumberString(date.getSeconds())}`;
    
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get timestamp of the date in the format `dd.mm.yyyy hh:mm:ss`.
 * @param date Date object.
 * @returns Timestamp as a string.
 */
function getTimestamp(date : Date) : string
{
    const dateString = getDateString(date);
    const timeString = getTimeString(date);
    
    return `${dateString} ${timeString}`;
}

/**
 * Generate random string of varied length. Possible characters are `[A_Z0-9]`.
 * @param length Length of the string. Default is 6.
 * @returns Random string of varied length
 */
function getToken(length : number = 6) : string
{
    let result = [];
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    
    for(let i = 0; i < length; i++)
    {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    
    return result.join('');
}

//#endregion