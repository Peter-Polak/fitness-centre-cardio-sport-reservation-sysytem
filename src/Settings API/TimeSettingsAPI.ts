
function addTimeSetting(sessionTimeString : string)
{
    let timeSettings = new TimeSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    timeSettings.AddTime(sessionTime);

    return timeSettings.times;
}


function removeTimeSetting(sessionTimeString : string)
{
    let timeSettings = new TimeSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    timeSettings.RemoveTime(sessionTime);

    return timeSettings.times;
}