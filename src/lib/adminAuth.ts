export const ADMIN_EMAILS = [
    'lira.chefs@gmail.com',
    'admin@alltrip.com'
];

export function isAdminEmail(email?: string | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
}
