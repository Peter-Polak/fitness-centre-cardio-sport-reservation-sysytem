/**
 * Scripts for e-mails.
 */


function sendConfirmationEmail(reservationForm : ReservationForm)
{
    let user = addUser(reservationForm.emailAddress);
    let htmlBody = getEmailBodyReservations(reservationForm, user); // Get HTML content
    
    //#region Prepare e-mail object and send it
    
    let mail = 
    {
        name: "Fitness centrum Cardio Sport", // Name shown as an author of the e-mail
        to: reservationForm.emailAddress, // Recipient from form
        subject: getEmailSubject(reservationForm.reservations),
        htmlBody: htmlBody
    };
    
    MailApp.sendEmail(mail);
    
    //#endregion
}

function getEmailSubject(reservations : Array<Reservation>)
{
    let subject = "Potvrdenie rezervácie - ";
    let sessionsString = "";
    
    for(const reservation of reservations)
    {
        const session = reservation.session;
        
        if(sessionsString !== "") sessionsString += ", ";
        sessionsString += session.getDateTimeString;
    }

    return subject + sessionsString;
}
 

function getEmailBodyReservations(reservationForm : ReservationForm, user : User) : string
{
    var template = HtmlService.createTemplateFromFile('form-confirmation-email'); // Create template
        
    let sessionDays = [];

    for(const reservation of reservationForm.reservations)
    {
        sessionDays.push(getDayOfWeekString(getEuropeDay(reservation.session.startDate)));
    }

    // Fill the template with the information from the form
    template.name = reservationForm.name;
    template.surname = reservationForm.surname;
    template.reservations = reservationForm.reservations;
    template.sessionDays = sessionDays;
    template.user = user;

    let htmlBody = template.evaluate().getContent(); // Evaluate template and get HTML content

    return htmlBody;
}