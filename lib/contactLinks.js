export function getWhatsAppHref(value) {
    if (!value) return '';

    const trimmed = String(value).trim();
    if (!trimmed) return '';

    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('876')) {
        return `https://wa.me/1${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('1')) {
        return `https://wa.me/${digits}`;
    }

    return trimmed;
}
