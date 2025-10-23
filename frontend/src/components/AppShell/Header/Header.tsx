import React from 'react';
import { HStack } from '../../Layout/HStack.tsx';

import styles from './Header.module.css';

interface HeaderProps {
    children: React.ReactNode;
}

const Header = ({ children }: HeaderProps) => {
    return (
        <HStack align={'center'} justify={'center'} className={styles.header}>
            <span className={styles.children}>{children}</span>
        </HStack>
    );
};
export default Header;
