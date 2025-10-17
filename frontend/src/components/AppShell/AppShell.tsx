import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';

const AppShell = () => {
  return (
    <>
      <p>NavBar</p>
      <Outlet />
    </>
  );
};
export default AppShell;
