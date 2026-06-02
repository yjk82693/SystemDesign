export function generatePublicId(firstName: string, lastName: string) {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const randLetter = letters[Math.floor(Math.random() * 26)];
    const number = Math.floor(1000 + Math.random() * 9000); // 4-digit, no leading zero
    return (
        firstName[0].toLowerCase() +
        randLetter +
        lastName[0].toLowerCase() +
        number
    );
}
