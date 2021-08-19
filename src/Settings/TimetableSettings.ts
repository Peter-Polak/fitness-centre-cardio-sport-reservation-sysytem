
function addTimeToTimetable(day : keyof Timetable, sessionTimeString : string)
{
    let timetableSettings = new TimetableSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    timetableSettings.AddTime(day, sessionTime);

    return timetableSettings.timetable;
}


function removeTimeFromTimetable(day : keyof Timetable, sessionTimeString : string)
{
    let timetableSettings = new TimetableSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    Logger.log(day);
    Logger.log(sessionTimeString);
    Logger.log(sessionTime);

    timetableSettings.RemoveTime(day, sessionTime);

    return timetableSettings.timetable;
}