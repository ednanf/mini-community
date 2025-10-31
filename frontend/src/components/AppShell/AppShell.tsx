import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useTheme from '../../hooks/useTheme.ts';
import Header from './Header/Header.tsx';
import NavBar from './NavBar/NavBar.tsx';
import styles from './AppShell.module.css';

const AppShell = () => {
    const { theme, toggleTheme } = useTheme();

    const [token, setToken] = useState(localStorage.getItem('token'));

    const location = useLocation();

    const navigate = useNavigate();

    const toastTheme = theme === 'dark' ? 'dark' : 'light';

    // Prevent access to protected routes if not authenticated
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Paths where the header and navbar should be hidden
    const hiddenLayoutPaths = ['/', '/login', '/register'];
    const showLayout = !hiddenLayoutPaths.includes(location.pathname);

    // Derive a user-friendly location name from the current path
    const pathSegment = location.pathname.split('/')[1] || 'home';
    const locationName = pathSegment
        .replaceAll('-', ' ')
        .replace(/^\w/, (c) => c.toUpperCase());

    // Update token state on localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
        };

        // The 'storage' event fires when a storage area (localStorage/sessionStorage)
        // has been changed in the context of another document.
        window.addEventListener('storage', handleStorageChange);

        // Custom event to handle changes within the same tab,
        // as the 'storage' event doesn't fire for the tab that made the change.
        // This 'local-storage' event is dispatched from your login/logout logic.
        window.addEventListener('local-storage', handleStorageChange);

        // Cleanup event listeners on unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleStorageChange);
        };
    }, []);

    return (
        <div className={styles.layout}>
            {showLayout && (
                <header>
                    <Header>{locationName}</Header>
                </header>
            )}
            <main className={styles.main}>
                <Outlet context={{ theme, toggleTheme, token }} />
            </main>
            {showLayout && (
                <nav className={styles.nav}>
                    <NavBar />
                </nav>
            )}
            <ToastContainer
                className={styles.toastContainer}
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnHover
                theme={toastTheme}
            />
        </div>
    );
};
export default AppShell;
