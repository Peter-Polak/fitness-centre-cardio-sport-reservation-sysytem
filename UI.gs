const htmlFiles =
{
    form : "form-html",
    sidebar : "Sidebar"
};

function renderUI()
{
    var ui = SpreadsheetApp.getUi();
    
    ui.createMenu('Rezervačný systém')
    .addSubMenu(ui.createMenu('Termíny').addItem("Vypísať termíny podľa rozvrhu", "addNewSessions").addItem("Archívovať staré termíny", "archiveOldSessions")/*.addItem("Vypísať termín/y", "")*/
                .addSubMenu(ui.createMenu('Deň').addItem("Pondelok", 'addMonday').addItem("Utorok", 'addTuesday').addItem("Streda", 'addWednesday').addItem("Štvrtok", 'addThursday').addItem("Piatok", 'addFriday').addItem("Sobota", 'addSaturday').addItem("Nedeľa", 'addSunday')))
    .addSubMenu(ui.createMenu('Formulár').addItem("Aktualizovať formúlar", "updateForm").addItem("Zobraziť formulár", 'showFormDialog'))
    .addSubMenu(ui.createMenu('Developer').addItem("Debug code", 'debug').addItem("Show e-mail example", 'showEmailExample'))
    .addToUi();
}

function showSidebar()
{
    var html = HtmlService.createHtmlOutputFromFile(htmlFiles.sidebar).setTitle('Sidebar').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(html); // Or DocumentApp or SlidesApp or FormApp.
}

function showFormSidebar()
{
    var html = HtmlService.createHtmlOutputFromFile(htmlFiles.form).setTitle('Formulár').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(html); // Or DocumentApp or SlidesApp or FormApp.
}

function showFormDialog()
{
    var html = HtmlService.createHtmlOutputFromFile(htmlFiles.form).setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
        .showModalDialog(html, 'Formulár na rezervovanie vstupu do fitness centra');
}

function showEmailExample()
{
    let sessions = "26.11.2020 16:30 - 18:30, 27.11.2020 20:00 - 22:00".split(', ');
    let sessionDays = [], sessionDates = [], sessionTimes = []
    for(var session of sessions)
    {
        Logger.log(session);
        sessionDays.push(getDayOfWeekString(getEuropeDay(getSessionDates(session).start)));
        sessionDates.push(getSessionDate(session).text);
        sessionTimes.push(getSessionTime(session).text);
    }
    
    var template = HtmlService.createTemplateFromFile('form-confirmation-email');
    template.sessions = sessions;
    template.name = "Peter";
    template.surname = "Polak";
    template.sessionDays = sessionDays;
    template.sessionDates = sessionDates;
    template.sessionTimes = sessionTimes;
    
    let htmlBody = template.evaluate().getContent();
    
    var html = HtmlService.createHtmlOutput(htmlBody.toString()).setTitle('E-mail example').setWidth(1280).setHeight(720);
    SpreadsheetApp.getUi().showDialog(html);
}