/**
 * Scripts for settings.
 */

enum PropertiesType
{
    DOCUMENT,
    SCRIPT,
    USER
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

function setPropertyScript(key : string, value : string)
{
    const scriptProperties = getPropertiesScript();
    scriptProperties.setProperty(key, value);
}

function setPropertyUser(key : string, value : string)
{
    const userProperties = getPropertiesUser();
    userProperties.setProperty(key, value);
}

//#endregion

//#region Property getters

function getPropertyScript(key : string)
{
    const scriptProperties = getPropertiesScript();
    return scriptProperties.getProperty(key);
}

//#endregion

function addToArrayProperty(key : string, value : object, sortFunc? : ((property : Array<object>) => Array<object>))
{
    let property = getPropertyScript(key);
    if(property == null) return;
    
    let currentValues : Array<object> = propertyToJson(property);
    
    currentValues.push(value);
    if(sortFunc != undefined) currentValues = sortFunc(currentValues);
    
    let newValuesString : string = propertyToString(currentValues);
    
    setPropertyScript(key, newValuesString);
    
    return currentValues;
}

function removeFromArrayProperty(key : string, index : number, sortFunc? : ((property : Array<object>) => Array<object>))
{
    let property = getPropertyScript(key);
    if(property == null) return;
    
    let currentValues : Array<object> = propertyToJson(property);
    
    currentValues.splice(index, 1);
    if(sortFunc != undefined) currentValues = sortFunc(currentValues);
    
    let newValuesString : string = propertyToString(currentValues);
    
    setPropertyScript(key, newValuesString);
    
    return currentValues;
}

function sortSessionTimes(sessionTimes : Array<SessionTime>)
{
    let sortedSessionTimes = sessionTimes.sort(
        (a, b) =>
        {
            let date1 : Date = new Date(2000, 1, 1, a.start.hours, a.start.minutes);
            let date2 : Date = new Date(2000, 1, 1, b.start.hours, b.start.minutes);
            
            if(date1 < date2) return -1;
            else if(date1 == date2) return 0;
            else if(date1 > date2) return 1;
            
            return 0;
        }
    );
    
    return sortedSessionTimes;
}

//#region Object settings helpers

/**
 * Converts JSON object to string. Used for saving objects as a value to properties.
 * @param settings Settings object to convert.
 */
function propertyToString(settings : any)
{
    return JSON.stringify(settings);
}

/**
 * Converts string representation of JSON object to proper JSON object. Used for retrieving JSON objects from properties values.
 * @param settings Settings object to convert.
 */
function propertyToJson(settings : string)
{
    return JSON.parse(settings);
}

//#endregion