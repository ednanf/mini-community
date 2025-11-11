import { useEffect, useState } from 'react';

function usePrefersColorScheme() {
    const getScheme = () =>
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const [scheme, setScheme] = useState(getScheme);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => setScheme(media.matches ? 'dark' : 'light');
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    return scheme;
}

export default usePrefersColorScheme;
