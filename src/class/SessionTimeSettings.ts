class SessionTimeSettings
{
    static key : string = "sessionTimes";
    sessionTimes!: Array<SessionTime>;

    constructor()
    {
        this.Load();
    }

    Load()
    {
        let propertyValue = getPropertyScript(SessionTimeSettings.key);
        this.sessionTimes = propertyToJson(propertyValue);
    }

    Save()
    {
        let propertyValue = propertyToString(this.sessionTimes);
        setPropertyScript(SessionTimeSettings.key, propertyValue);
    }

    AddTime(sessionTime : SessionTime)
    {
        this.sessionTimes.push(sessionTime);

        this.sessionTimes.sort(
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

    RemoveTime(sessionTime : SessionTime)
    {
        this.sessionTimes.forEach(
            (time, index) =>
            {
                if(
                    sessionTime.start.hours === time.start.hours &&
                    sessionTime.start.minutes === time.start.minutes &&
                    sessionTime.end.hours === time.end.hours &&
                    sessionTime.end.minutes === time.end.minutes
                )
                {
                    this.sessionTimes.splice(index, 1);
                }
            }
        );

        this.Save();
    }
}