/**
 * Scripts for the UI (menu, sidebar, dialog).
 */

/**
 * HTML file names.
 */
const htmlFiles =
{
    form : "form-html",
    sidebar : "Sidebar"
};

/**
 * Create menu for the reservation system.
 */
function renderUI()
{
    var ui = SpreadsheetApp.getUi();
    
    ui.createMenu('Rezervačný systém')
    .addSubMenu(ui.createMenu('Rezervácie').addItem("Skryť staré rezervácie", 'hideOldReservations'))
    .addSubMenu(ui.createMenu('Termíny').addItem("Vypísať termíny podľa rozvrhu", "addNewSessions").addItem("Archívovať staré termíny", "archiveOldSessions")/*.addItem("Vypísať termín/y", "")*/
                .addSubMenu(ui.createMenu('Deň').addItem("Pondelok", 'addMonday').addItem("Utorok", 'addTuesday').addItem("Streda", 'addWednesday').addItem("Štvrtok", 'addThursday').addItem("Piatok", 'addFriday').addItem("Sobota", 'addSaturday').addItem("Nedeľa", 'addSunday')))
    .addSubMenu(ui.createMenu('Formulár').addItem("Aktualizovať formúlar", "updateForm").addItem("Zobraziť formulár", 'showFormDialog'))
    .addSubMenu(ui.createMenu('Developer').addItem("Debug code", 'debug').addItem("Show e-mail example", 'showEmailExample'))
    .addToUi();
}

/**
 * Show Sidebar.html file in sidebar.
 */
function showSidebar()
{
    var html = HtmlService.createHtmlOutputFromFile(htmlFiles.sidebar).setTitle('Sidebar').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(html); // Or DocumentApp or SlidesApp or FormApp.
}

/**
 * Show reservation form in a sidebar.
 */
function showFormSidebar()
{
    var html = HtmlService.createHtmlOutputFromFile(htmlFiles.form).setTitle('Formulár').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(html); // Or DocumentApp or SlidesApp or FormApp.
}

/**
 * Show reservation form in a dialog.
 */
function showFormDialog()
{
    var html = HtmlService.createHtmlOutputFromFile(htmlFiles.form).setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
        .showModalDialog(html, 'Formulár na rezervovanie vstupu do fitness centra');
}


/**
 * Show an example of an e-mail sent to customers after making a reservation in a dialog window.
 */
function showEmailExample()
{
    //#region Prepare form mockup data
    
    const name = "Peter";
    const surname = "Polák";
    const sessions = "26.11.2020 16:30 - 18:30, 27.11.2020 20:00 - 22:00".split(', ');
    let sessionDays = [], sessionDates = [], sessionTimes = []
    for(var session of sessions)
    {
        sessionDays.push(getDayOfWeekString(getEuropeDay(getSessionDates(session).start)));
        sessionDates.push(getSessionDate(session).text);
        sessionTimes.push(getSessionTime(session).text);
    }
    
    //#endregion
    
    //#region Create HTMl template from file, fill it with the information from the form and get HTML content
    
    var template = HtmlService.createTemplateFromFile('form-confirmation-email');
    template.sessions = sessions;
    template.name = name;
    template.surname = surname;
    template.sessionDays = sessionDays;
    template.sessionDates = sessionDates;
    template.sessionTimes = sessionTimes;
    
    let htmlBody = template.evaluate().getContent();
    
    //#endregion
    
    //#region Show example e-mail
    
    var html = HtmlService.createHtmlOutput(htmlBody.toString()).setTitle('E-mail example').setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi().showDialog(html);
    
    //#endregion
}