/**
 * Gets called when user opens web app page.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML page to show to the user of the web app.
 */
function doGet(event : any)
{
    let parameters = event.parameter;
    
    let data = 
    {
        ...parameters
    };
    
    let htmlOutput = getHtmlOutputFromTemplate("app", data);
    
    return htmlOutput;
}

function getHtml(htmlFileName : string)
{
    return HtmlService.createHtmlOutputFromFile(htmlFileName).getContent();
}

function getHtmlOutputFromTemplate(templateFileName : string, templateData : {[key : string] : any})
{
    const htmlTemplate = HtmlService.createTemplateFromFile(templateFileName);
    
    for(const property in templateData)
    {
        htmlTemplate[property] = templateData[property];
    }
    
    const htmlOutput = htmlTemplate.evaluate();
    
    // Thank you! https://stackoverflow.com/questions/56423742/my-page-doesnt-scale-in-google-app-script-only-on-mobile-and-when-not-in-lands?answertab=votes#tab-top
    htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    return htmlOutput;
}

function getReservationFormHtml()
{
    const sessions = getAllSessionsFromSheet();
    const organizedSessions = organizeSessions(sessions);
    
    let data = 
    {
        sessions : organizedSessions,
    };
    
    let htmlOutput = getHtmlOutputFromTemplate("form", data);
    let html = htmlOutput.getContent();
    
    return html;
}

function onHtmlFormSubmit(formResponse : FormResponse)
{
    //#region Create form response object
    
    let reservation : Reservation = new Reservation(formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessions, formResponse.emailAddress);
    
    //#endregion
    
    //#region Process the form response.
    
    processReservation(reservation); // Add the form response to the reservations sheet.
    updateForm(); // Update the form.
    if(reservation.emailAdress != "") sendConfirmationEmail(reservation); // Send a confirmation e-mail if the user specified it.
    
    //#endregion
    
    return formResponse;
}

function processReservation(reservation : Reservation)
{
    //#region Check reservation validity
    
    let reservationValidity = isReservationValid(reservation);
    if(!reservationValidity.isValid)
    {
        let response = 
        {
            reservation : reservation,
            validity : reservationValidity
        };
        
        throw Error(JSON.stringify(response));
    }
    
    //#endregion
    
    appendReservation(reservation);
}