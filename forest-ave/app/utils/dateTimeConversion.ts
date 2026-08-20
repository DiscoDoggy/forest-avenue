
export type DeconstructedDate = {
    day: string;
    month: string;
    year: string;
}

export function convertUnixTimeToLocalDateTimeStr(unixTimeStamp: number): string {
    console.log(`Timestamp: ${unixTimeStamp}`);
    const date = new Date(unixTimeStamp);

    // Define precise Intl options for '01/31/2026 6:34pm'
    const options: Intl.DateTimeFormatOptions = {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true, // Forces 12-hour format with am/pm
    };

    const formattedString = new Intl.DateTimeFormat(undefined, options).format(date);

    return formattedString
        .replace(',', '')  // Removes comma between date and time (if added by locale)
        .replace(' ', ' ') // Standardizes spaces
        .toLowerCase();    // Ensures 'am'/'pm' are lowercase
}

export function convertUnixTimeLocalDateTimeObj(unixTimeStamp: number): DeconstructedDate {
    const date = new Date(unixTimeStamp * 1000);
    const options: Intl. DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(date);

    const dateParts = formatter.formatToParts(date);

    const day = dateParts.find(p => p.type === 'day')!.value;     // "09"
    const month = dateParts.find(p => p.type === 'month')!.value; // "08"
    const year = dateParts.find(p => p.type === 'year')!.value;   // "2026"

    const parts: DeconstructedDate = {
        day: day,
        month: month,
        year: year
    };

    return  parts;
}