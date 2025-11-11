const mongodbDateFormatter = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const day = d.toLocaleString(undefined, { day: '2-digit' });
    const month = d.toLocaleString(undefined, { month: 'long' });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
    return `${day} ${month} ${year}, ${time}`;
};

export default mongodbDateFormatter;
