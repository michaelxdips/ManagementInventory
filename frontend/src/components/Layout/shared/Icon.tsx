/**
 * Shared Icon component used by both desktop and mobile navigation.
 * Extracted from AuthLayout to prevent duplication.
 */
export const Icon = ({ name }: { name: string }) => {
    const stroke = 'currentColor';
    switch (name) {
        case 'grid':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <rect x="4" y="4" width="6" height="6" rx="1.5" />
                    <rect x="14" y="4" width="6" height="6" rx="1.5" />
                    <rect x="4" y="14" width="6" height="6" rx="1.5" />
                    <rect x="14" y="14" width="6" height="6" rx="1.5" />
                </svg>
            );
        case 'box':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M4 7.5 12 12l8-4.5M4 7.5 12 3l8 4.5M4 7.5v9L12 21l8-4.5v-9" strokeLinejoin="round" />
                </svg>
            );
        case 'in':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M5 12h14M12 5v14M12 5l-3 3M12 5l3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'out':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M5 12h14M12 19V5M12 19l-3-3M12 19l3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'request':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M8 9h8M8 12h5" strokeLinecap="round" />
                </svg>
            );
        case 'info':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 9.5v5M12 7.2v.1" strokeLinecap="round" />
                </svg>
            );
        case 'check':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M5 12.5 10 17l9-10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'empty':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M8 8h8v8H8z" opacity="0.35" />
                </svg>
            );
        case 'units':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M4 10h7V4H4v6Zm9 10h7v-6h-7v6ZM4 20h7v-6H4v6Zm9-10h7V4h-7v6Z" />
                </svg>
            );
        case 'quota':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9" />
                    <path d="M12 3v9l6.36 3.64" />
                </svg>
            );
        case 'menu':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
            );
        case 'close':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'more':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
                    <circle cx="12" cy="12" r="1.5" fill={stroke} />
                    <circle cx="12" cy="6" r="1.5" fill={stroke} />
                    <circle cx="12" cy="18" r="1.5" fill={stroke} />
                </svg>
            );
        case 'settings':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 7 3.6V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c0 .26.06.52.17.76a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
            );
        case 'logout':
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17 21 12 16 7" />
                    <path d="M21 12H9" />
                </svg>
            );
        default:
            return null;
    }
};

export default Icon;
