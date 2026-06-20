

export function convertUnixTimeToLocalDateTime(unixTimeStamp: number): string {
    const unixMilliseconds = unixTimeStamp * 1000;

        return unixMilliseconds.toLocaleString();
}