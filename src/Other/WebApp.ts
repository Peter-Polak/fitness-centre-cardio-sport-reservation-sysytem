enum Page
{
    INFO = "info", 
    FORM = "form", 
    RESERVATIONS_FORM = "reservations-form",
    RESERVATIONS = "reservations"
}


/**
 * Gets called when user opens web app page.
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML page to show to the user of the web app.
 */
function doGet(event : any)
{
    let parameters = event.parameter;
    
    let data = 
    {
        pageContent : getPageContent(parameters.page),
        ...parameters
    };
    
    let htmlOutput = getHtmlOutputFromTemplate("app", data);
    
    return htmlOutput;
}

/**
 * 
 * @param {Page} page 
 * @returns {string} HTML code
 */
function getPageContent(page : Page) : string
{
    switch(page)
    {
        case Page.FORM:
            return getReservationFormHtml();
        
        case Page.RESERVATIONS:
            return getHtml("reservations-form");
            
        case Page.INFO:
        default:
            return getHtml("info");
    }
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

/**
 * Even handler that fires after user fills out the form and sends it. Checks the validity of the reservation and processes the reservation.
 * @param {FormResponse} formResponse Object representing the form fields.
 */
function onHtmlFormSubmit(formResponse : FormResponse)
{
    let webAppResponsesSheet = getWebAppResponsesSheet();
    if(webAppResponsesSheet != null)
    {
        webAppResponsesSheet.appendRow([formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessions, formResponse.emailAddress]);
    }
    
    //#region Create form response object
    
    let reservation : Reservation = new Reservation(formResponse.timestamp, formResponse.name, formResponse.surname, formResponse.sessions, formResponse.emailAddress);
    
    //#endregion
    
    //#region Process the form response.
    
    processReservation(reservation); // Add the form response to the reservations sheet.
    updateForm(); // Update the Google Form.
    if(reservation.emailAddress != "") sendConfirmationEmail(reservation); // Send a confirmation e-mail if the user specified it.
    
    //#endregion
    
    return formResponse;
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

function getReservationsHtmlByEmail(emailAddress : string)
{
    const reservations = getReservationsByEmail(emailAddress);
    
    let data = 
    {
        reservations : reservations,
    };
    
    let htmlOutput = getHtmlOutputFromTemplate("reservations", data);
    let html = htmlOutput.getContent();
    
    return html;
}

function getReservationsHtmlByToken(token : string)
{
    const reservations = getReservationsByToken(token);
    
    let data = 
    {
        reservations : reservations,
    };
    
    let htmlOutput = getHtmlOutputFromTemplate("reservations", data);
    let html = htmlOutput.getContent();
    
    return html;
}