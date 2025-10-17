import { Outlet } from 'react-router-dom';
import NavBar from '../NavBar/NavBar.tsx';
import styles from './AppShell.module.css';

const AppShell = () => {
  return (
    <div className={styles.layout}>
      <header>
        <h1>App Header</h1>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <nav className={styles.nav}>
        <NavBar />
      </nav>
    </div>
  );
};
export default AppShell;
