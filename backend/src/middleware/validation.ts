export function isStrongPassword(password: string): boolean {
    return (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[!@#$%^&*()_\-+=]/.test(password) &&
        !/012|123|234|345|456|567|678|789/.test(password) &&
        !/(.)\1\1/.test(password)
    );
}
