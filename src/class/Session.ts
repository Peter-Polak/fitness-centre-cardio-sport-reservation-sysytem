//@ts-ignore // Complains because it is declared in Google Apps Script types file
class Session implements ISession
{
    startDate : Date;
    endDate : Date;
    capacity : number;
    reserved : number;
    
    constructor(startDate : Date, endDate : Date, capacity? : number, reserved? : number)
    {
        this.startDate = startDate;
        this.endDate = endDate;
        this.capacity = capacity ? capacity : 0;
        this.reserved = reserved ? reserved : 0;
    }
    
    get getFreeSpaces()
    {
        return this.capacity - this.reserved;
    }
    
    get getDateString()
    {
        return getDateString(this.startDate);
    }
    
    get getTimeString()
    {
        let start =`${getNumberString(this.startDate.getHours())}:${getNumberString(this.startDate.getMinutes())}`;
        let end = `${getNumberString(this.endDate.getHours())}:${getNumberString(this.endDate.getMinutes())}`;
        
        return `${start} - ${end}`;
    }
    
    get getTimeStrings()
    {
        let start =`${getNumberString(this.startDate.getHours())}:${getNumberString(this.startDate.getMinutes())}`;
        let end = `${getNumberString(this.endDate.getHours())}:${getNumberString(this.endDate.getMinutes())}`;
        
        return {start : start, end : end};
    }
    
    get getDateTimeString()
    {
        return `${this.getDateString} ${this.getTimeString}`;
    }
    
    get getStartDay()
    {
        return  getDayOfWeekString(getEuropeDay(this.startDate));
    }
    
    get getJson()
    {
        const sessionObject : SessionJson = 
        {
            start : 
            {
                date : this.startDate,
                string : 
                {
                    date : this.getDateString,
                    time : this.getTimeStrings.start
                }
            },
            end : 
            {
                date : this.endDate,
                string : 
                {
                    date : this.getDateString,
                    time : this.getTimeStrings.end
                }
            },
            date : this.getDateString,
            time : this.getTimeString,
            capacity : this.capacity,
            reserved : this.reserved
        }
        
        return sessionObject;
    }
    
    static getDatesFromString(string : string) : { start : Date, end : Date} | undefined
    {
        let sessionDateRegex = /(([0][1-9])|([12][0-9])|(3[0-1]))\.(([0][1-9])|([1][0-2]))\.([0-9]+)/;
        let sessionTimeRegex = /(([01][0-9])|(2[0-3])):(([0-5][0-9])) - (([01][0-9])|(2[0-3])):(([0-5][0-9]))/;
        
        let dateResult = sessionDateRegex.exec(string);
        let timeResult = sessionTimeRegex.exec(string);
        if(dateResult == null || timeResult == null) return;
        
        let dateString = dateResult[0];
        let timeString = timeResult[0];
        
        let date = 
        {
            day: parseInt(dateString.substr(0, 2)),
            month: parseInt(dateString.substr(3, 2)) - 1, // January = 0
            year : parseInt(dateString.substr(6, 4))
        }
        
        let textTime = 
        {
            start:
            {
                hours : timeString.substr(0, 2),
                minutes: timeString.substr(3, 2)
            },
            end:
            {
                hours : timeString.substr(8, 2),
                minutes: timeString.substr(11, 2)
            }
        };
        
        let numberTime = 
        {
            start:
            {
                hours : parseInt(textTime.start.hours),
                minutes: parseInt(textTime.start.minutes)
            },
            end:
            {
                hours : parseInt(textTime.end.hours),
                minutes: parseInt(textTime.end.minutes)
            }
        };
        
        let startDate = new Date(date.year, date.month, date.day, numberTime.start.hours, numberTime.start.minutes, 0, 0);
        let endDate = new Date(date.year, date.month, date.day, numberTime.end.hours, numberTime.end.minutes, 0, 0);
        
        let dates = 
        {
            start : startDate,
            end: endDate
        }
        
        return dates;
    }
}