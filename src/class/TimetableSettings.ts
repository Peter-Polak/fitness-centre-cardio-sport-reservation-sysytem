class TimetableSettings
{
    static key : string = "timetable";
    timetable! : Timetable;

    constructor()
    {
        this.Load();
    }

    Load()
    {
        let propertyValue = getPropertyScript(TimetableSettings.key);
        Logger.log(propertyValue);
        this.timetable = propertyToJson(propertyValue);
    }

    Save()
    {
        let propertyValue = propertyToString(this.timetable);
        setPropertyScript(TimetableSettings.key, propertyValue);
    }

    AddTime(day : keyof Timetable, sessionTime : SessionTime)
    {
        let dayTimetable = this.timetable[day];

        dayTimetable.push(sessionTime);
        dayTimetable.sort(
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

        this.Save();
    }

    RemoveTime(day : keyof Timetable, sessionTime : SessionTime)
    {
        let dayTimetable = this.timetable[day];

        dayTimetable.forEach(
            (time, index) =>
            {
                if(
                    sessionTime.start.hours === time.start.hours &&
                    sessionTime.start.minutes === time.start.minutes &&
                    sessionTime.end.hours === time.end.hours &&
                    sessionTime.end.minutes === time.end.minutes
                )
                {
                    dayTimetable.splice(index, 1);
                }
            }
        );

        this.Save();
    }
}
