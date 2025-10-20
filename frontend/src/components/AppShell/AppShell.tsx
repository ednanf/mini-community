import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header/Header.tsx';
import NavBar from '../NavBar/NavBar.tsx';
import styles from './AppShell.module.css';

const AppShell = () => {
  const location = useLocation();

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

  return (
    <div className={styles.layout}>
      {location.pathname !== '/' && (
        <header>
          <Header backButton={showBackButton}>{locationName}</Header>
        </header>
      )}
      <main className={styles.main}>
        <Outlet />
      </main>
      {location.pathname !== '/' && (
        <nav className={styles.nav}>
          <NavBar />
        </nav>
      )}
    </div>
  );
};
export default AppShell;
