/**
 * Scripts for debugging.
 */

var debugVariable = "";

/**
 * Appends string to the debug variable.
 * @param string String to append.
 */
function addDebugString(string : string)
{
    debugVariable += string;
}

/**
 * Show sidebar with debug variable (or specified string) as it's content.
 * @param [string] Optional. If specified, it will show this instead of the debug variable. 
 */
function debug(string? : string)
{
    let debugString = string ? string : debugVariable;
    
    var html = HtmlService.createHtmlOutput(debugString).setTitle('Dubugging');
    SpreadsheetApp.getUi().showSidebar(html);
}