/**
 * Scripts for the UI (menu, sidebar, dialog).
 */

/**
 * HTML file names.
 */
enum HtmlFiles
{
    FORM = "form-html",
    SETTINGS =  "settings"
};

/**
 * Create menu for the reservation system.
 */
function renderUI()
{
    const ui = SpreadsheetApp.getUi();
    
    let reservationSystemMenu = ui.createMenu("Rezervačný systém");
    let reservationsMenu = ui.createMenu("Rezervácie").addItem("Skryť staré rezervácie", "hideOldReservations");
    let sessionsMenu = ui.createMenu("Termíny").addItem("Vypísať termíny podľa rozvrhu", "addNewSessions").addItem("Archívovať staré termíny", "archiveOldSessions");
    let formMenu = ui.createMenu("Formulár").addItem("Aktualizovať formúlar", "updateForm").addItem("Zobraziť formulár", "showFormDialog");
    let emailMenu = ui.createMenu("E-mail").addItem("Ukázať príklad e-mailu", "showEmailExample").addItem("Poslať príklad e-mailu", "sendTestEmail");
    let settingsMenu = ui.createMenu("Nastavenia").addItem("Časy", "showTimesSettings");
    let developerMenu = ui.createMenu("Developer").addItem("Debug code", "debug");
    
    reservationSystemMenu
    .addSubMenu(reservationsMenu)
    .addSubMenu(sessionsMenu)
    .addSubMenu(formMenu)
    .addSubMenu(emailMenu)
    .addSubMenu(settingsMenu)
    .addSubMenu(developerMenu);
    
    reservationSystemMenu.addToUi();
}

/**
 * Show reservation form in a dialog.
 */
function showFormDialog()
{
    var html = HtmlService.createHtmlOutputFromFile(HtmlFiles.FORM).setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
        .showModalDialog(html, 'Formulár na rezervovanie vstupu do fitness centra');
}

function getEmailExampleHtmlBody()
{
    //#region Prepare form mockup data
    
    const name = "Peter";
    const surname = "Polák";
    const dates = [Session.getDatesFromString("26.11.2020 16:30 - 18:30"), Session.getDatesFromString("27.11.2020 20:00 - 22:00")];
    if(dates[0] == undefined || dates[1] == undefined) return;
    
    const sessions = [ new Session(dates[0].start, dates[0].end), new Session(dates[1].start, dates[1].end) ];
    let sessionDays = [];
    
    for(var session of sessions)
    {
        sessionDays.push(getDayOfWeekString(getEuropeDay(session.startDate)));
    }
    
    //#endregion
    
    return getEmailBodyReservations(name, surname, sessions, sessionDays); // Get HTML content
}

/**
 * Show an example of an e-mail sent to customers after making a reservation in a dialog window.
 */
function showEmailExample()
{
    let htmlBody = getEmailExampleHtmlBody(); // Get HTML content
    if(htmlBody == undefined) return;
    
    //#region Show example e-mail
    
    var html = HtmlService.createHtmlOutput(htmlBody.toString()).setTitle('E-mail example').setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi().showDialog(html);
    
    //#endregion
}

function sendTestEmail()
{
    var ui = SpreadsheetApp.getUi();

    var result = ui.prompt(
        "Poslať ukážku e-mailu",
        "E-mailová adresa:",
        ui.ButtonSet.OK_CANCEL
    );

    // Process the user's response.
    var selectedButton = result.getSelectedButton();
    var emailAdress = result.getResponseText();
    
    if (selectedButton == ui.Button.OK) // User clicked "OK".
    {
        let htmlBody = getEmailExampleHtmlBody(); // Get HTML content
        
        let mail = 
        {
            name: "Fitness centrum Cardio Sport", // Name shown as an author of the e-mail
            to: emailAdress, // Recipient from dialog text
            subject: "Potvrdenie rezervácie termínu vstupu do Fitness centra Cardio Sport",
            htmlBody: htmlBody
        };
    
        MailApp.sendEmail(mail);
        
        ui.alert(`E-mail bol zaslaný na adresu ${emailAdress}.`);
    }
    else if (selectedButton == ui.Button.CANCEL) // User clicked "Cancel".
    { 
        
    }
    else if (selectedButton == ui.Button.CLOSE) // User clicked X in the title bar.
    {
        
    }
}

function showTimesSettings()
{
    let property = getPropertyScript("times");
    if(property == null) return;
    
    let times : Array<SessionTime> = propertyToJson(property);
    
    var template = HtmlService.createTemplateFromFile(HtmlFiles.SETTINGS); // Create template
     
    template.times = times;
     
    let htmlBody = template.evaluate().getContent(); // Evaluate template and get HTML content
    
    var html = HtmlService.createHtmlOutput(htmlBody).setTitle('Settings').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(html);
}