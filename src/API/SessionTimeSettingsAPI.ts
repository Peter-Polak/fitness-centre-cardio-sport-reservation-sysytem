/**
 * Adds specified session time to the session time settings.
 * @param sessionTimeString Session time as a string.
 * @returns {Array<SessionTime>} Array of all session times.
 */
function addTimeSetting(sessionTimeString : string) : Array<SessionTime>
{
    let sessionTimeSettings = new SessionTimeSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    sessionTimeSettings.AddTime(sessionTime);

    return sessionTimeSettings.sessionTimes;
}


/**
 * Removes specified session time from the session time settings.
 * @param sessionTimeString Session time as a string.
 * @returns {Array<SessionTime>} Array of all session times.
 */
function removeTimeSetting(sessionTimeString : string) : Array<SessionTime>
{
    let sessionTimeSettings = new SessionTimeSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    sessionTimeSettings.RemoveTime(sessionTime);

    return sessionTimeSettings.sessionTimes;
}