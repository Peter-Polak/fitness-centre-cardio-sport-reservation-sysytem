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

function getSpreadsheet()
{
    return SpreadsheetApp.getActive();
}

function getForm()
{
    let formURL = getSpreadsheet().getFormUrl();
    let form = FormApp.openByUrl(formURL);
    
    return form;
}

function getReservationSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Reservations.Name);
}

function getSessionSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Session.Name);
}

function getSettingsSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Settings.Name);
}

function getArchiveSheet()
{
    return getSpreadsheet().getSheetByName(Sheets.Archive.Name);
}

// Get day in week that starts with Monday(1 -> 0) instead of Sunday (0 -> 6)
function getEuropeDay(date)
{
    return (date.getDay() + 6) % 7;
}

function getSession(cells, index)
{
    let session =
        {
            date : 
            {
                original : new Date(cells[index][0]),
                formated : Utilities.formatDate(new Date(cells[index][0]), "Europe/Bratislava", "dd.MM.yyyy")
            },
            time : 
            {
                text : cells[index][1],
                start : 
                {
                    hours : cells[index][1].substr(0, 2),
                    minutes : cells[index][1].substr(3, 2)
                },
                end : 
                {
                    hours : cells[index][1].substr(8, 2),
                    minutes : cells[index][1].substr(11, 2)
                }
            },
            capacity : cells[index][2],
            reserved : cells[index][3],
            free : cells[index][4]
        };
    
    return session;
}

function getNextDay(x)
{
    var now = new Date();    
    now.setDate(now.getDate() + (x+(7-now.getDay())) % 7);
  
    let dateFormated = Utilities.formatDate(now, "GMT+1", "dd.MM.yyyy");
    return dateFormated;
}

function getDayOfWeekString(day)
{
    const dayOfWeek = 
    [
        "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"
    ];
    
    return dayOfWeek[day];
}

function getSessionDates(sessionString)
{
    
    let date = getSessionDate(sessionString);
    let time = getSessionTime(sessionString);
    
    let sessionDates = 
    {
        start: new Date(date.year, date.month - 1, date.day, time.start.hours, time.start.minutes, 0),
        end: new Date(date.year, date.month - 1, date.day, time.end.hours, time.end.minutes, 0),
    }
    
    return sessionDates;
}

function getSessionDate(sessionString)
{
    let date = 
    {
        text: sessionString.substr(0, 10),
        day : sessionString.substr(0, 2),
        month : sessionString.substr(3, 2),
        year : sessionString.substr(6, 4)
    }
    
    return date;
}

function getSessionTime(sessionString)
{
    let time = 
    {
        text: sessionString.substr(11, 13),
        start :
        {
            hours: sessionString.substr(11, 2),
            minutes: sessionString.substr(14, 2)
        },
        end :
        {
            hours: sessionString.substr(19, 2),
            minutes: sessionString.substr(22, 2)
        }
    }
    
    return time;
}