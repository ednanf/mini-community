import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useTheme from '../../hooks/useTheme.ts';
import Header from '../Header/Header.tsx';
import NavBar from '../NavBar/NavBar.tsx';
import styles from './AppShell.module.css';

const AppShell = () => {
    const { theme, toggleTheme } = useTheme();
    // TODO: use token to determine which UI is shown
    const [token, setToken] = useState(localStorage.getItem('token'));

    const location = useLocation();

    const toastTheme = theme === 'dark' ? 'dark' : 'light';

    // Paths where the header and navbar should be hidden
    const hiddenLayoutPaths = ['/', '/login', '/register'];
    const showLayout = !hiddenLayoutPaths.includes(location.pathname);

    // Derive a user-friendly location name from the current path
    const pathSegment = location.pathname.split('/')[1] || 'home';
    const locationName = pathSegment.replaceAll('-', ' ').replace(/^\w/, (c) => c.toUpperCase());

    // Routes that should show the back button
    const staticPaths = ['/new-post', '/edit-profile'];
    const dynamicPathPrefixes = ['/post/', '/user/'];

    // Determine if the back button should be shown based on the routes above
    const showBackButton =
        staticPaths.includes(location.pathname) ||
        dynamicPathPrefixes.some((prefix) => location.pathname.startsWith(prefix));

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

    // TODO: change the conditional layout to check also if the user is authenticated or not
    // This will allow to see a public profile page without the header and navbar when not logged in

    return (
        <div className={styles.layout}>
            {showLayout && (
                <header>
                    <Header backButton={showBackButton}>{locationName}</Header>
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
