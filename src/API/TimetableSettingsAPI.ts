/**
 * Adds specified session time to the timetabel settings for that day.
 * @param day Day in the week.
 * @param sessionTimeString Session time as a string.
 * @returns {Timetable} Current timetable after addition.
 */
function addTimeToTimetable(day : keyof Timetable, sessionTimeString : string) : Timetable
{
    let timetableSettings = new TimetableSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    timetableSettings.AddTime(day, sessionTime);

    return timetableSettings.timetable;
}

/**
 * Removes specified session time from the timetabel settings for that day.
 * @param day Day in the week.
 * @param sessionTimeString Session time as a string.
 * @returns {Timetable} Current timetable after removal.
 */
function removeTimeFromTimetable(day : keyof Timetable, sessionTimeString : string)
{
    let timetableSettings = new TimetableSettings();
    let sessionTime = new SessionTime(sessionTimeString);

    timetableSettings.RemoveTime(day, sessionTime);

    return timetableSettings.timetable;
}