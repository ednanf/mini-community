import React from 'react';
import styles from './PillButton.module.css';
import { HStack } from '../../Layout/HStack.tsx';

interface PillButtonProps {
    icon?: React.ReactNode;
    type: 'button' | 'submit' | 'reset';
    handleClick?: () => void;
    color?: 'default' | 'red' | 'green';
    disabled?: boolean;
    children?: React.ReactNode;
}

const PillButton = ({
    icon,
    type,
    handleClick,
    color = 'default',
    disabled,
    children,
}: PillButtonProps) => {
    return (
        <button
            type={type}
            onClick={handleClick}
            className={`${styles.button} ${styles[`${color}`]}`}
            disabled={disabled}
        >
            <HStack align={'center'} justify={'center'} gap={'sm'}>
                {children}
                {/* Render icon if provided */}
                {icon && <span className={styles.icon}>{icon}</span>}{' '}
            </HStack>
        </button>
    );
};
export default PillButton;
