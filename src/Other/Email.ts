/**
 * Scripts for e-mails.
 */

/**
 * Get HTML body for confirmation e-mail for reservations.
 * @param {string} name Name of the recipient.
 * @param {string} surname Surname of the recipient.
 * @param {Array<string>} sessions Array of sessions in string form.
 * @param {Array<string>} sessionDays Array of string name of the days in the week for each sesion.
 * @returns {string} HTML body of the e-mail.
 * @example getReservationEmailBody("Peter", "Polák", ["01.01.1970 08:00 - 09:00", ...], ["Pondelok", ...])
 */
 function getEmailBodyReservations(name : string, surname : string, sessions : Array<Session>, sessionDays : Array<string>) : string
 {
     var template = HtmlService.createTemplateFromFile('form-confirmation-email'); // Create template
     
     // Fill the template with the information from the form
     template.name = name;
     template.surname = surname;
     template.sessions = sessions;
     template.sessionDays = sessionDays;
     
     let htmlBody = template.evaluate().getContent(); // Evaluate template and get HTML content
     
     return htmlBody;
 }