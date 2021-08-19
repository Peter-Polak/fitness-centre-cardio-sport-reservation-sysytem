/**
 * Handler for all GET requests.
 * @param event Event object with query parameters.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(event : any) : GoogleAppsScript.Content.TextOutput
{
    let response = processGetRequest(event.parameter);
    
    return ContentService.createTextOutput(JSON.stringify(response));
}

/**
 * Handler for all POST requests.
 * @param event Event object with query parameters.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(event : any) : GoogleAppsScript.Content.TextOutput
{
    let response = processPostRequest(event.parameter);

    return ContentService.createTextOutput(JSON.stringify(response));
}