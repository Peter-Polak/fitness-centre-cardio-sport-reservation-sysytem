var debugVariable = "";

function addDebugString(string)
{
    debugVariable += string;
}

function debug(string)
{
    let debugString = string ? string : debugVariable;
    
    var html = HtmlService.createHtmlOutput(debugString).setTitle('Dubugging');
    SpreadsheetApp.getUi().showSidebar(html);
}