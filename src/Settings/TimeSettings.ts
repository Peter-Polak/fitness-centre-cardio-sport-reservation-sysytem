
function addTimeSetting(sessionTime : SessionTime)
{
    let timeSettings = new TimeSettings();
    timeSettings.AddTime(sessionTime);

    return timeSettings.times;
}


function removeTimeSetting(sessionTime : SessionTime)
{
    let timeSettings = new TimeSettings();
    timeSettings.RemoveTime(sessionTime);

    return timeSettings.times;
}