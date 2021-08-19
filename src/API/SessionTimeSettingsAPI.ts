
function addTimeSetting(sessionTimeString : string)
{
    let sessionTimeSettings = new SessionTimeSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    sessionTimeSettings.AddTime(sessionTime);

    return sessionTimeSettings.sessionTimes;
}


function removeTimeSetting(sessionTimeString : string)
{
    let sessionTimeSettings = new SessionTimeSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    sessionTimeSettings.RemoveTime(sessionTime);

    return sessionTimeSettings.sessionTimes;
}