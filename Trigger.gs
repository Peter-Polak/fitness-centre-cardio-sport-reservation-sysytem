function addProjectTriggers()
{
    let spreadsheet = getSpreadsheet();
    
    // Spreadsheet
    ScriptApp.newTrigger('renderUI')
    .forSpreadsheet(spreadsheet)
    .onOpen()
    .create();
    
    ScriptApp.newTrigger('updateForm')
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();
    
    ScriptApp.newTrigger('onFormSubmitInstallable')
    .forSpreadsheet(spreadsheet)
    .onFormSubmit()
    .create();
    
    // Time based
    ScriptApp.newTrigger('addNewSessions')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
    
    ScriptApp.newTrigger('updateForm')
    .timeBased()
    .everyHours(1)
    .create();
    
    ScriptApp.newTrigger('archiveOldSessions')
    .timeBased()
    .everyHours(1)
    .create();
}

function deleteAllTriggers()
{
    var triggers = ScriptApp.getProjectTriggers();
    
    for (var i = 0; i < triggers.length; i++)
    {
        ScriptApp.deleteTrigger(triggers[i]);
    }
}