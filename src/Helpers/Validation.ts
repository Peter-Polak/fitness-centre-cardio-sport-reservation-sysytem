
function checkReservationFormValidity(reservationForm : ReservationForm)
{
    let reservationFormValidity : ReservationFormValidity = 
    {
        object : reservationForm,
        isValid : true,
        invalidityReasons : []
    };
    
    const { name, surname, emailAddress, reservations } = reservationForm;
    
    const nameValidity = checkTextFieldValidity("name", name, true);
    const surnameValidity = checkTextFieldValidity("surname", surname, true);
    const reservationValidities = getReservationsValidities(reservations);
    
    if(!nameValidity.isValid)
    {
        reservationFormValidity.isValid = false;
        reservationFormValidity.invalidityReasons.push(nameValidity)
    };
    
    if(!surnameValidity.isValid)
    {
        reservationFormValidity.isValid = false;
        reservationFormValidity.invalidityReasons.push(surnameValidity);
    }
    
    for(const reservationValidity of reservationValidities)
    {
        if(!reservationValidity.isValid)
        {
            reservationFormValidity.invalidityReasons.push(reservationValidity);
        }
    }

    if(reservationFormValidity.invalidityReasons.length > 0)
    {
        reservationFormValidity.isValid = false;
    }
    
    return reservationFormValidity;
}

function checkTextFieldValidity(name : string, value : string, isRequired : boolean, pattern? : RegExp)
{
    let textFieldValidity : TextFieldValidity= 
    { 
        object: 
        {
            name : name,
            value : value
        }, 
        isValid : true,
        invalidityReasons : []
    }
    
    if(isRequired && (value === null || value === undefined || value === ""))
    {
        let reason : TextFieldIvalidityReason = 
        {
            value : value,
            error : TextFieldError.IS_REQUIRED
        }
        
        textFieldValidity.isValid = false;
        textFieldValidity.invalidityReasons.push(reason);
    }
    
    return textFieldValidity;
}

function getReservationValidity(reservation : Reservation, allReservations : Array<Reservation>, activeSessions : Array<Session>) : ReservationValidity
{
    let reservationValidity : ReservationValidity = 
    {
        object : reservation.getJson,
        isValid : true,
        invalidityReasons : []
    }
    
    // Check session validity
    let sessionInvalidityReason = checkSessionValidity(reservation.session, activeSessions);
    if(sessionInvalidityReason !== null) reservationValidity.invalidityReasons.push(sessionInvalidityReason);

    for(const existingReservation of allReservations)
    {
        // Check if reservation already exists
        if(
            existingReservation.name == reservation.name 
            && existingReservation.surname == reservation.surname 
            && existingReservation.session.startDate.getTime() == reservation.session.startDate.getTime() 
            && existingReservation.session.endDate.getTime() == reservation.session.endDate.getTime()
        )
        {
            let reason : ReservationInvalidityReason = 
            {
                value : reservation.getJson,
                error : ReservationError.RESERVATION_EXISTS
            };
            
            reservationValidity.invalidityReasons.push(reason);
            break;
        }
    }
    
    // If there are any invalidities, set the reservation validity to false
    if(reservationValidity.invalidityReasons.length > 0) 
    {
        reservationValidity.isValid = false;
    }

    return reservationValidity;
}


function checkSessionValidity(session : Session, activeSessions : Array<Session>) : SessionInvalidityReason | null
{
    const notFoundReason : SessionInvalidityReason = 
    {
        value : session.getJson,
        error : SessionError.NOT_FOUND
    };

    const fullReason : SessionInvalidityReason = 
    {
        value : session.getJson,
        error : SessionError.FULL
    };

    const endedReason : SessionInvalidityReason = 
    {
        value : session.getJson,
        error : SessionError.ENDED
    };


    // Check if there are no active sessions
    if(activeSessions.length == 0)
    {
        return notFoundReason;
    };

    if(Date.now() > session.endDate.getTime())
    {
        return endedReason;
    };


    for(const activeSession of activeSessions)
    {
        // Check if the session is active
        if(session.startDate.getTime() == activeSession.startDate.getTime())
        {
            // Check if the session is full
            if(activeSession.getFreeSpaces <= 0)
            {
                return fullReason;
            }
            else
            {
                return null;
            }
        }
    }
    
    return notFoundReason;
}


function getReservationsValidities(reservations : Array<Reservation>) : Array<ReservationValidity>
{
    const activeSessions = getAllSessionsFromSheet();
    const allReservations = getAllReservations();
    
    let validities : Array<ReservationValidity> = [];
    
    for(const reservation of reservations)
    {
        validities.push(getReservationValidity(reservation, allReservations, activeSessions));
    }
    
    return validities;
}