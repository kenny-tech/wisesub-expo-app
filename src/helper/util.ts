export const formatAmount = (amt: string) =>
    parseFloat(amt || "0").toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};