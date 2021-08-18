class Reservation implements IReservation
 {
    timestamp : string;
    name : string;
    surname: string;
    //@ts-ignore
    session : Session;
    sessionString : string;
    emailAddress : string;
    wasCancelled : boolean | undefined;
    wasntPresent : boolean | undefined;
    
    constructor(
    timestamp : string, 
    name : string, 
    surname: string, 
    session : Session | string, 
    emailAdress : string, 
    wasCancelled? : boolean, 
    wasntPresent? : boolean
    )
    {
        this.timestamp = timestamp;
        this.name = name;
        this.surname = surname;
        this.emailAddress = emailAdress;
        this.wasCancelled = wasCancelled;
        this.wasntPresent = wasntPresent;
        
        if(typeof session === "string")
        {
            this.sessionString = session;
        
            let sessionDates = Session.getDatesFromString(this.sessionString);
            if(sessionDates == undefined) return;
            
            this.session = new Session(sessionDates.start, sessionDates.end);
        }
        else
        {
            this.session = session;
            this.sessionString = session.getDateTimeString;
        } 
    }
    
    get getJson()
    {
        let json : ReservationJson = 
        {
            timestamp : this.timestamp,
            name : this.name,
            surname : this.surname,
            emailAddress : this.emailAddress,
            session : this.session.getJson,
            sessionString : this.sessionString,
            wasCancelled : this.wasCancelled,
            wasntPresent : this.wasntPresent,
        }
        
        return json;
    }
 }