
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

enum UsersSheetColumns
{
    EmailAddress = 1,
    Token,
}

//#endregion

//#region Sheets

const ReservationsSheet : Sheet<typeof ReservationsSheetColumns> = 
{
    name : "Rezervácie",
    startingRow : 4,
    columns : ReservationsSheetColumns,
    numberOfColumns : Object.keys(ReservationsSheetColumns).length / 2
};

const SessionsSheet : Sheet<typeof SessionsSheetColumns> = 
{
    name : "Termíny",
    startingRow : 5,
    columns : SessionsSheetColumns,
    numberOfColumns : Object.keys(SessionsSheetColumns).length / 2
};

const UsersSheet : Sheet<typeof UsersSheetColumns> = 
{
    name : "Users",
    startingRow : 1,
    columns : UsersSheetColumns,
    numberOfColumns : Object.keys(UsersSheetColumns).length / 2
};

//#endregion
