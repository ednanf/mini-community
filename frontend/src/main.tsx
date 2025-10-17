import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Pages
import Layout from './components/Layout/Layout.tsx';
import EditProfile from './pages/EditProfile/EditProfile.tsx';
import GlobalFeed from './pages/GlobalFeed/GlobalFeed.tsx';
import LandingPage from './pages/LandingPage/LandingPage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import MyFeed from './pages/MyFeed/MyFeed.tsx';
import MyProfile from './pages/MyProfile/MyProfile.tsx';
import NotFound from './pages/NotFound/NotFound.tsx';
import NewPost from './pages/NewPost/NewPost.tsx';
import PostDetails from './pages/PostDetails/PostDetails.tsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.tsx';
import Settings from './pages/Settings/Settings.tsx';
import ViewProfile from './pages/ViewProfile/ViewProfile.tsx';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegistrationPage /> },
      { path: 'global-feed', element: <GlobalFeed /> },
      { path: 'my-feed', element: <MyFeed /> },
      { path: 'my-profile', element: <MyProfile /> },
      { path: 'edit-profile', element: <EditProfile /> },
      { path: 'profile/:userId', element: <ViewProfile /> },
      { path: 'post/:postId', element: <PostDetails /> },
      { path: 'new-post', element: <NewPost /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
