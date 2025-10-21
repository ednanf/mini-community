import React from 'react';
import { Link } from 'react-router-dom';

import styles from './RoundButtonLink.module.css';

interface NewPostButtonProps {
  to: string;
  icon: React.ReactNode;
}

const RoundButtonLink = ({ to, icon }: NewPostButtonProps) => {
  return (
    <Link to={to} className={styles.link}>
      {icon && <span className={styles.icon}>{icon}</span>}
    </Link>
  );
};
export default RoundButtonLink;
