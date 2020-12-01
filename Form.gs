function onFormSubmitInstallable(formResponseEvent)
{
    if(formResponseEvent === undefined) return;
    
    let data = formResponseEvent.values; // Form data in array, ordered as in sheet of responses
    Logger.log(JSON.stringify(data));
    if(data[0] === undefined || data[1] === undefined || data[2] === undefined || data[3] === undefined) return;
    
    let formResponse = 
    {
        timestamp : data[0],
        name : data[1],
        surname : data[2],
        sessions : data[3].split(', '),
        emailAdress : data[4]
    };
    
    processFormResponse(formResponse);
    updateForm();
    if(formResponse.emailAdress != "") sendConfirmationEmail(formResponse);
}

function processFormResponse(formResponseObject)
{
    if(!formResponseObject) return;
    let formResponse = formResponseObject;

    let reservationSheet = getReservationSheet();
    let lastColumn = reservationSheet.getDataRange().getLastColumn();
    let lastRow = reservationSheet.getDataRange().getLastRow();

    const sourceRange = reservationSheet.getRange(2, 1, 1, lastColumn); // Template to copy (second row in reservations sheet)
    const targetRange = reservationSheet.getRange(lastRow + 1, 1, formResponse.sessions.length, lastColumn); // Last row of reservations sheet + rows after that based on number of reservations made

    sourceRange.copyTo(targetRange);
    
    // Prepare reservations data in 2D array to set into sheet
    let reservations = [];
    for(var index = 0; index < formResponse.sessions.length; index++)
    {
        reservations[index] = 
        [
            formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessions[index], formResponse.emailAdress, 'FALSE'
        ];
    }

    targetRange.setValues(reservations);

    reservationSheet.sort(1, true); // Sort sheet based on timestamp column
}

function updateForm()
{
    // Session Sheet
    let sessionSheet = getSessionSheet();
    let cells = sessionSheet.getDataRange().getValues();
    
    // Form
    let form = getForm();
    let checkbox = form.getItems(FormApp.ItemType.CHECKBOX)[0].asCheckboxItem();
    let checkboxChoices = [];
    
    for(let n = 4; n < cells.length; n++)
    {
        let currentDate = new Date();
        let session = getSession(cells, n);
        
        session.date.original.setHours(session.time.start.hours);
        session.date.original.setMinutes(session.time.start.minutes);
        session.date.original.setSeconds(0);
        
        if(session.free > 0 && session.capacity && (currentDate.getTime() <= session.date.original.getTime())) // If there is free space and tha capacity isn't 0 and the session hasn't already started
        {
            let checkboxChoice = session.date.formated + " " + session.time.text + " (" + session.free + "/" + session.capacity + ")";
            checkboxChoices.push(checkboxChoice);
        }
    }
    if(checkboxChoices.length == 0) checkboxChoices.push("Nie su žiadne volné terminy.");
    checkbox.setChoiceValues(checkboxChoices);
}

function sendConfirmationEmail(formResponseObject)
{
    let formResponse = formResponseObject;
    let sessionDays = [], sessionDates = [], sessionTimes = [];
    
    for(var index = 0; index < formResponse.sessions.length; index++)
    {
        let session = formResponse.sessions[index];
        formResponse.sessions[index] = session.slice(0, -5); // Remove free space and capacity from end of the string (eg. "(6/6)")
        sessionDays.push(getDayOfWeekString(getEuropeDay(getSessionDates(session).start)));
        // sessionDates.push(getSessionDate(session).text);
        // sessionTimes.push(getSessionTime(session).text);
    }
    
    // Get HTML body for e-mail
    var template = HtmlService.createTemplateFromFile('form-confirmation-email');
    template.name = formResponse.name;
    template.surname = formResponse.surname;
    template.sessions = formResponse.sessions;
    template.sessionDays = sessionDays;
    let htmlBody = template.evaluate().getContent();

    // Prepare e-mail object
    let mail = 
        {
            name: "Fitness centrum Cardio Sport", // Name shown as an author of the e-mail
            to: formResponse.emailAdress, // Recipient from form
            subject: "Potvrdenie rezervácie termínu vstupu do Fitness centra Cardio Sport",
            htmlBody: htmlBody
        };
    
    MailApp.sendEmail(mail);
}