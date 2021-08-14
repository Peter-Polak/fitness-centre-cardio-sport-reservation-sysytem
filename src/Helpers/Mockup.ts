function getMockupReservationForm(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", sessions : string = "24.12.2021 10:00 - 12:00", emailAddress : string = "peter.polak.mail@gmail.com")
{
    return new ReservationForm(timestamp, name, surname, emailAddress, sessions);
}

/**
 * Get resrvation object with mockup data.
 * @param timestamp Timestamp of reservation.
 * @param name Customer's name.
 * @param surname Customer's surname.
 * @param sessions Sessions to reserve.
 * @param emailAddress Custome's e-mail address.
 */
 function getMockupReservation(timestamp : string = "01.01.2021 00:00:00", name : string = "Peter", surname : string = "Polák", session : Session = getMockupSession(), emailAddress : string = "peter.polak.mail@gmail.com")
 {
     return new Reservation(timestamp, name, surname, session, emailAddress);
 }

