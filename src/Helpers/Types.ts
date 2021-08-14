//#region Errors

enum TextFieldError
{
    IS_REQUIRED,
    INVALID_INPUT
}

enum ReservationError
{
    RESERVATION_EXISTS = "RESERVATION_EXISTS"
}

enum SessionError
{
    NOT_FOUND = "NOT_FOUND",
    FULL = "FULL",
    ENDED = "ENDED"
}

enum SessionsError
{
    NO_SESSIONS = "NO_SESSIONS",
    NEW_RESERVATIONS_NOT_ALOWED = "NEW_RESERVATIONS_NOT_ALOWED"
}

//#endregion


//#region Validity

interface Validity<Object, InvalidityReason>
{
    object : Object
    isValid : boolean
    invalidityReasons : Array<InvalidityReason>
}
interface ReservationFormValidity extends Validity<IReservationForm, TextFieldValidity | ReservationValidity>{}
interface ReservationValidity extends Validity<ReservationJson, ReservationInvalidityReason | SessionInvalidityReason>{}
interface TextFieldValidity extends Validity<{ name : string, value : string }, TextFieldIvalidityReason>{}

//#endregion


//#region Invalidity Reason

interface InvalidityReason<Value, Error>
{
    value : Value
    error : Error
}
interface TextFieldIvalidityReason extends InvalidityReason<string, TextFieldError>{}
interface ReservationInvalidityReason extends InvalidityReason<ReservationJson, ReservationError>{}
interface SessionInvalidityReason extends InvalidityReason<SessionJson, SessionError>{}

//#endregion


interface IReservationForm
{ 
    timestamp : string;
    name : string;
    surname: string;
    sessionsString : string;
}

interface IReservation
{ 
    timestamp : string;
    name : string;
    surname: string;
    session : ISession;
    sessionString : string;
    emailAddress : string;
    wasCancelled : boolean | undefined;
    wasntPresent : boolean | undefined;
}

interface ISession
{ 
    startDate : Date;
    endDate : Date;
    capacity : number;
    reserved : number;
}

interface ReservationJson
{ 
    timestamp : string;
    name : string;
    surname: string;
    session : SessionJson;
    sessionString : string;
    emailAddress : string;
    wasCancelled : boolean | undefined;
    wasntPresent : boolean | undefined;
}

interface SessionJson
{ 
    start : 
    {
        date : Date,
        string : 
        {
            date : string,
            time : string
        }
    },
    end : 
    {
        date : Date,
        string : 
        {
            date : string,
            time : string
        }
    },
    date : string,
    time : string,
    capacity : number,
    reserved : number
}

interface OrganizedSessions
{ 
    [date: string]: 
    { 
        day: string, 
        free : Array<SessionJson>, 
        full : Array<SessionJson> 
    } 
}

interface User
{
    emailAddress : string
    token : string
}

//#region Settings

interface AppSettings
{
    times : Array<SessionTime>
    timetable : Timetable
    capacity : number
    scheduleOfNewSessions : WeekSchedule
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

interface SessionTime
{
    start : Time
    end : Time
}


interface Time
{
    hours : number,
    minutes : number
}

//#endregion