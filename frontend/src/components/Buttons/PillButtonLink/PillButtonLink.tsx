import React from 'react';
import { Link } from 'react-router-dom';

import styles from './PillButtonLink.module.css';

interface PillButtonLinkProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const PillButtonLink = ({ to, icon, children }: PillButtonLinkProps) => {
  return (
    <Link to={to} className={styles.link}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </Link>
  );
};
export default PillButtonLink;
