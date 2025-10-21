import React from 'react';
import { HStack } from '../../Layout/HStack.tsx';
import BackButton from './BackButton/BackButton.tsx';

import styles from './Header.module.css';

interface HeaderProps {
    backButton: boolean;
    children: React.ReactNode;
}

// TODO: move the back button to the left side and ensure the title is centered

const Header = ({ backButton, children }: HeaderProps) => {
    return (
        <HStack align={'center'} justify={'center'} className={styles.header}>
            {backButton ? (
                <span className={styles.backButtonWrapper}>
                    <BackButton />
                </span>
            ) : (
                ''
            )}
            <span className={styles.children}>{children}</span>
        </HStack>
    );
};
export default Header;
