export const formatSentAgo = (date) => {

    if (!date) return "";

    const now = new Date();

    const sent = new Date(date);

    const diff = Math.floor(
        (now - sent) / 1000
    );

    if (diff < 60) return `${diff}s`;

    if (diff < 3600)
        return `${Math.floor(diff / 60)}m`;

    if (diff < 86400)
        return `${Math.floor(diff / 3600)}h`;

    return `${Math.floor(diff / 86400)}d`;
};