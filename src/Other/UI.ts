// -------------------------------------------
// Scripts for the UI (menu, sidebar, dialog).
// -------------------------------------------


/**
 * Create menu for the reservation system.
 */
function renderUI()
{
    const ui = SpreadsheetApp.getUi();
    
    let reservationSystemMenu = ui.createMenu("Rezervačný systém");
    let reservationsMenu = ui.createMenu("Rezervácie").addItem("Skryť staré rezervácie", "hideOldReservations");
    let sessionsMenu = ui.createMenu("Termíny").addItem("Vypísať termíny podľa rozvrhu", "addNewSessions").addItem("Archívovať staré termíny", "archiveOldSessions");
    let formMenu = ui.createMenu("Formulár").addItem("Aktualizovať formúlar", "updateGoogleForm");
    let emailMenu = ui.createMenu("E-mail").addItem("Ukázať príklad e-mailu", "showEmailExample").addItem("Poslať príklad e-mailu", "sendTestEmail");
    let settingsMenu = ui.createMenu("Nastavenia").addItem("Časy termínov", "showSessionTimeSettings").addItem("Otváracie hodiny", "showTimetableSettings");
    let developerMenu = ui.createMenu("Developer").addItem("Debug code", "debug").addItem("Delete all properties", "showDeletePropertiesDialog").addItem("Delete all triggers", "showDeleteTriggersDialog");
    
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
 * Show an example of an e-mail sent to customers after making a reservation in a dialog window.
 */
function showEmailExample()
{
    let reservationForm = getMockupReservationForm();
    let user : User = 
    {
        emailAddress : reservationForm.emailAddress,
        token : getToken()
    };
    
    let htmlBody = getEmailBodyReservations(reservationForm, user); // Get HTML content
    if(htmlBody == undefined) return;
    
    //#region Show example e-mail
    
    var html = HtmlService.createHtmlOutput(htmlBody.toString()).setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi().showModalDialog(html, "E-mail example");
    
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
        let reservationForm = getMockupReservationForm(undefined, undefined, undefined, undefined, emailAdress);
        let user : User = 
        {
            emailAddress : reservationForm.emailAddress,
            token : getToken()
        };
        
        let htmlBody = getEmailBodyReservations(reservationForm, user); // Get HTML content
        
        let mail = 
        {
            name: "Fitness centrum Cardio Sport", // Name shown as an author of the e-mail
            to: emailAdress, // Recipient from dialog text
            subject: getEmailSubject(reservationForm.reservations),
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

function showSessionTimeSettings()
{
    let sessionTimeSettings = new SessionTimeSettings();
    
    var template = HtmlService.createTemplateFromFile(SessionTimeSettings.key); // Create template
    template.sessionTimes = sessionTimeSettings.sessionTimes;
     
    let htmlBody = template.evaluate().getContent(); // Evaluate template and get HTML content
    
    var html = HtmlService.createHtmlOutput(htmlBody).setTitle("Settings - Session Times").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(html);
}

function showTimetableSettings()
{
    let sessionTimeSettings = new SessionTimeSettings();
    let timetableSettings = new TimetableSettings();
    
    var template = HtmlService.createTemplateFromFile(TimetableSettings.key); // Create template
     
    template.timetable = timetableSettings.timetable;
    template.sessionTimes = sessionTimeSettings.sessionTimes;
    
    let htmlBody = template.evaluate().getContent(); // Evaluate template and get HTML content
    
    var html = HtmlService.createHtmlOutput(htmlBody).setWidth(1280).setHeight(720).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showModalDialog(html, "Settings - Timetable");
}

function showDeletePropertiesDialog()
{
    var ui = SpreadsheetApp.getUi();
    var result = ui.alert(
        "Delete all properties",
        "Are you sure you want to delete all properties?",
        ui.ButtonSet.YES_NO
    );
    
    if (result == ui.Button.YES) // User clicked "OK".
    {
        deleteAllProperties();
        ui.alert("All properties have been deleted!");
    }
    else if (result == ui.Button.NO) // User clicked "Cancel".
    { 
        
    }
}

function showDeleteTriggersDialog()
{
    var ui = SpreadsheetApp.getUi();
    var result = ui.alert(
        "Delete all properties",
        "Are you sure you want to delete all triggers?",
        ui.ButtonSet.YES_NO
    );

    if (result == ui.Button.YES) // User clicked "OK".
    {
        deleteAllTriggers();
        ui.alert("All triggers have been deleted!");
    }
    else if (result == ui.Button.NO) // User clicked "Cancel".
    { 
        
    }
}