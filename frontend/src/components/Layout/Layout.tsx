import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <p>NavBar</p>
      <Outlet />
    </>
  );
};
export default Layout;
