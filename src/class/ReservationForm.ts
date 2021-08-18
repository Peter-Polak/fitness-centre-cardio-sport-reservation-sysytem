class ReservationForm
{
    timestamp : string;
    name : string;
    surname : string;
    emailAddress : string;
    sessionsString : string ;
    
    reservations : Array<Reservation>;
    
    constructor(timestamp : string, name : string, surname : string, emailAddress : string, sessionsString : string)
    {
        this.timestamp = timestamp;
        this.name = name;
        this.surname = surname;
        this.emailAddress = emailAddress;
        this.sessionsString = sessionsString;
        
        this.reservations = [];
        
        let sessionStrings = this.sessionsString.split(", ");
        
        for(const sessionString of sessionStrings)
        {
            const dates = Session.getDatesFromString(sessionString);
            if(dates === undefined) continue;
            
            const session = new Session(dates.start, dates.end);
            const reservation = new Reservation(this.timestamp, this.name, this.surname, session, this.emailAddress);
            this.reservations.push(reservation);
        }
    }
}