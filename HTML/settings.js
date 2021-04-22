function addSession()
{
    let session = 
    {
        start :
        {
            hours: document.getElementById("sessionStartHours").value,
            minutes: document.getElementById("sessionStartMinutes").value
        },
        end : 
        {
            hours: document.getElementById("sessionEndHours").value,
            minutes: document.getElementById("sessionEndMinutes").value
        }
    }

    google.script.run.addSessionTime(session);
    
}