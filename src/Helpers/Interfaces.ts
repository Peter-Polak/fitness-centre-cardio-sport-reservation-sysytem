/**
 * Interfaces
 */

interface FormResponse
{
    timestamp : string
    name : string
    surname : string
    sessions : Array<string>
    emailAdress : string
}

interface Time
{
    hours : number,
    minutes : number
}

interface Session
{
    start : Time
    end : Time
}

interface Timetable
{ 
    monday : Array<Session>, 
    tuesday : Array<Session>, 
    wednesday : Array<Session>, 
    thursday : Array<Session>, 
    friday : Array<Session>, 
    saturday : Array<Session>, 
    sunday : Array<Session>
}

interface DaySchedule
{
    monday : boolean, 
    tuesday : boolean, 
    wednesday : boolean, 
    thursday : boolean, 
    friday : boolean, 
    saturday : boolean, 
    sunday : boolean
}

interface WeekSchedule
{
    monday : DaySchedule, 
    tuesday : DaySchedule, 
    wednesday : DaySchedule, 
    thursday : DaySchedule, 
    friday : DaySchedule, 
    saturday : DaySchedule, 
    sunday : DaySchedule
}

interface AppSettings
{
    times : Array<Session>
    timetable : Timetable
    capacity : number
    scheduleOfNewSessions : WeekSchedule
}