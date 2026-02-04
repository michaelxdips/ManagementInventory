/**
 * Format a date string or Date object to 'DD/MM/YYYY'
 * Example: 2026-01-14 -> 14/01/2026
 */
export const formatDateV2 = (date: string | Date | null | undefined): string => {
    if (!date) return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Format date for input field (YYYY-MM-DD)
 * Required for <input type="date" /> value
 */
export const formatInputDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};
