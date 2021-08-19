
//#region Collumns

enum ReservationsSheetColumns
{
    Timestamp = 1,
    Name,
    Surname,
    Session,
    EmailAddress,
    WasCancelled,
    WasntPresent
}

enum SessionsSheetColumns
{
    Date = 1,
    Time,
    Capacity,
    Reserved,
    Free
}

//#endregion

//#region Sheets

const ReservationsSheet : Sheet<typeof ReservationsSheetColumns> = 
{
    name : "Rezervácie",
    startingRow : 4,
    columns : ReservationsSheetColumns,
    numberOfColumns : Object.keys(ReservationsSheetColumns).length
};

const SessionsSheet : Sheet<typeof SessionsSheetColumns> = 
{
    name : "Termíny",
    startingRow : 5,
    columns : SessionsSheetColumns,
    numberOfColumns : Object.keys(SessionsSheetColumns).length
};

//#endregion
