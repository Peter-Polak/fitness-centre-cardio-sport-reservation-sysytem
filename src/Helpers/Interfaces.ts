/**
 * Interfaces
 */

interface FormResponse
{ 
    timestamp : string
    name: string
    surname : string
    sessions : string
    email : string
}

interface Time
{
    hours : number,
    minutes : number
}

interface SessionTime
{
    start : Time
    end : Time
}

interface Timetable
{ 
    monday : Array<SessionTime>, 
    tuesday : Array<SessionTime>, 
    wednesday : Array<SessionTime>, 
    thursday : Array<SessionTime>, 
    friday : Array<SessionTime>, 
    saturday : Array<SessionTime>, 
    sunday : Array<SessionTime>
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
    times : Array<SessionTime>
    timetable : Timetable
    capacity : number
    scheduleOfNewSessions : WeekSchedule
}

interface ReservationValidity
{
    isValid : boolean
    reasons : Array<{
        session : Session
        error : SessionError
    }>
}

enum SessionError
{
    DOES_NOT_EXIST = "DOESNT_EXIST",
    IS_FULL = "FULL"
}

interface OrganizedSessions
{ 
    [key: string]: 
    { 
        day: string, 
        free : Array<Session>, 
        full : Array<Session> 
    } 
}