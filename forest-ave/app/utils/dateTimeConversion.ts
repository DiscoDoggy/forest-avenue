

export function convertUnixTimeToLocalDateTime(unixTimeStamp: number): string {
    console.log(`Timestamp: ${unixTimeStamp}`);
    const date = new Date(unixTimeStamp * 1000);

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
