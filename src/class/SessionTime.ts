class SessionTime
{
    start : Time;
    end : Time;
    string : string;

    constructor(sessionTimeString : string)
    {
        this.string = sessionTimeString;

        this.start = new Time(sessionTimeString.substr(0, 5));
        this.end = new Time(sessionTimeString.substr(8, 5));
    }
}