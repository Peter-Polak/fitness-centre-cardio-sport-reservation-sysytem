var debugVariable = "";

function debug()
{
    
    var html = HtmlService.createHtmlOutput(debugVariable.toString()).setTitle('Dubugging');
    SpreadsheetApp.getUi().showSidebar(html);
}
