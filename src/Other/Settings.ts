/**
 * Scripts for settings.
 */

enum PropertiesType
{
    DOCUMENT,
    SCRIPT,
    USER
}

interface Time
{
    hours : number,
    minutes : number
}

interface Session
{
    start : Time
    end : Time
}

interface Timetable
{ 
    monday : Array<Session>, 
    tuesday : Array<Session>, 
    wednesday : Array<Session>, 
    thursday : Array<Session>, 
    friday : Array<Session>, 
    saturday : Array<Session>, 
    sunday : Array<Session>
}

interface DaySchedule
{
    monday : boolean, 
    tuesday : boolean, 
    wednesday : boolean, 
    thursday : boolean, 
    friday : boolean, 
    saturday : boolean, 
    sunday : boolean
}

interface WeekSchedule
{
    monday : DaySchedule, 
    tuesday : DaySchedule, 
    wednesday : DaySchedule, 
    thursday : DaySchedule, 
    friday : DaySchedule, 
    saturday : DaySchedule, 
    sunday : DaySchedule
}

interface AppSettings
{
    times : Array<Session>
    timetable : Timetable
    capacity : number
    scheduleOfNewSessions : WeekSchedule
}

//#region Properties getters

/**
 * Get document properties.
 * @returns {GoogleAppsScript.Properties.Properties} documentProperties
 */
function getPropertiesDocument() : GoogleAppsScript.Properties.Properties
{
    let documentProperties = PropertiesService.getDocumentProperties();
    
    return documentProperties;
}

/**
 * Get script properties.
 * @returns {GoogleAppsScript.Properties.Properties} scriptProperties
 */
function getPropertiesScript() : GoogleAppsScript.Properties.Properties
{
    let scriptProperties = PropertiesService.getScriptProperties();
    
    return scriptProperties;
}

/**
 * Get user properties.
 * @returns {GoogleAppsScript.Properties.Properties} User properties.
 */
function getPropertiesUser() : GoogleAppsScript.Properties.Properties
{
    let userProperties = PropertiesService.getUserProperties();
    
    return userProperties;
}

/**
 * Get properties of type `type`.
 * @param {PropertiesType} type Type of properties to return.
 * @returns {GoogleAppsScript.Properties.Properties} Properties of type `type`
 */
function getProperties(type : PropertiesType) : GoogleAppsScript.Properties.Properties
{
    let properties : GoogleAppsScript.Properties.Properties;
    
    switch(type)
    {
        case PropertiesType.DOCUMENT:
            properties = getPropertiesDocument();
            break;
        case PropertiesType.USER:
            properties = getPropertiesUser();
            break;
        case PropertiesType.SCRIPT:
            properties = getPropertiesScript();
            break;
    }
    
    return properties;
}

//#endregion

//#region Settings setters

/**
 * Sets/saves document settings.
 * @param {{[key: string]: string;}} documentSettings Settings to set/save
 */
function saveSettingsDocument(documentSettings : {[key: string]: string;})
{
    getPropertiesDocument().setProperties(documentSettings);
}

/**
 * Sets/saves script settings.
 * @param {{[key: string]: string;}}scriptSettings Settings to set/save
 */
function saveSettingsScript(scriptSettings : {[key: string]: string;})
{
    getPropertiesScript().setProperties(scriptSettings);
}

/**
 * Sets/saves user settings.
 * @param {{[key: string]: string;}}userSettings Settings to set/save
 */
 function saveSettingsUser(userSettings : {[key: string]: string;})
 {
     getPropertiesUser().setProperties(userSettings);
 }

/**
 * Sets/saves settings of type `type`.
 * @param type Type of settings.
 * @param settings Settings to set/save.
 */
function saveSettings(type : PropertiesType, settings : {[key: string]: string;})
{
    switch(type)
    {
        case PropertiesType.DOCUMENT:
            saveSettingsDocument(settings)
            break;
        case PropertiesType.USER:
            saveSettingsUser(settings)
            break;
        case PropertiesType.SCRIPT:
            saveSettingsScript(settings)
            break;
    }
}

//#endregion

//#region Settings getters

/**
 * Get settings of type document.
 * @returns {{[key: string]: string;}}  Document settings.
 */
 function getSettingsDocument() : {[key: string]: string;}
 {
     const documentProperties = getPropertiesDocument();
     let documentSettings = documentProperties.getProperties();
     
     return documentSettings;
 }
 
 /**
 * Get settings of type script.
 * @returns {{[key: string]: string;}} Script settings.
 */
function getSettingsScript() : {[key: string]: string;}
{
    const scriptProperties = getPropertiesScript();
    let scriptSettings = scriptProperties.getProperties();
    
    return scriptSettings;
}

/**
 * Get settings of type user.
 * @returns {{[key: string]: string;}} User settings.
 */
 function getSettingsUser() : {[key: string]: string;}
 {
     const userProperties = getPropertiesUser();
     let userSettings = userProperties.getProperties();
     
     return userSettings;
 }
 
 /**
 * Get settings of type `type`.
 * @returns {{[key: string]: string;}} Settings of type `type`
 */
function getSettings(type : PropertiesType) : {[key: string]: string;}
{
    const documentProperties = getPropertiesDocument();
    let documentSettings = documentProperties.getProperties();
    
    return documentSettings;
}

//#endregion

//#region Property setters

function setPropertyDocument(key : string, value : string)
{
    const documentProperties = getPropertiesDocument();
    documentProperties.setProperty(key, value);
}

//#endregion

function addSessionTime(time : Session)
{
    let times : Array<Session> = settingsToJson(getSettingsDocument()["time"]);
    times.push(time);
    let timesString : string = settingsToString(times);
    
    setPropertyDocument("time", timesString);
}


//#region Object settings helpers

/**
 * Converts JSON object to string. Used for saving objects as a value to properties.
 * @param settings Settings object to convert.
 */
function settingsToString(settings : any)
{
    return JSON.stringify(settings);
}

/**
 * Converts string representation of JSON object to proper JSON object. Used for retrieving JSON objects from properties values.
 * @param settings Settings object to convert.
 */
function settingsToJson(settings : string)
{
    return JSON.parse(settings);
}

//#endregion