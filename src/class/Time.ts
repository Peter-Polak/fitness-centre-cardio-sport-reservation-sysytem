class Time
{
    hours : number;
    minutes : number;
    string : string;
    
    constructor(timeString : string)
    {
        this.string = timeString;

        this.hours = parseInt(timeString.substr(0, 2));
        this.minutes = parseInt(timeString.substr(3, 2));
    }
}