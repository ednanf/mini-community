import NavBarButton from './NavBarButton.tsx';
import RoundButtonLink from '../../Buttons/RoundButtonLink/RoundButtonLink.tsx';

import { CiGlobe } from 'react-icons/ci';
import { CgFeed } from 'react-icons/cg';
import { GoPerson } from 'react-icons/go';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import { GoPlus } from 'react-icons/go';
import styles from './NavBar.module.css';
import { HStack } from '../../Layout/HStack.tsx';

const NavBar = () => {
    return (
        <HStack justify="between" className={styles.navBarHStack}>
            <div className={styles.navBar}>
                <NavBarButton to={'global-feed'} icon={<CiGlobe />}>
                    Global
                </NavBarButton>

                <NavBarButton to={'my-feed'} icon={<CgFeed />}>
                    My Feed
                </NavBarButton>

                <RoundButtonLink to={'new-post'} icon={<GoPlus />} />

                <NavBarButton to={'my-profile'} icon={<GoPerson />}>
                    Profile
                </NavBarButton>

                <NavBarButton to={'settings'} icon={<HiOutlineCog6Tooth />}>
                    Settings
                </NavBarButton>
            </div>
        </HStack>
    );
};
export default NavBar;
