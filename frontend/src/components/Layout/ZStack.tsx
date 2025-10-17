import React from 'react';
import styles from './Stack.module.css';

interface ZStackProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: boolean; // centers all children
}

export const ZStack: React.FC<ZStackProps> = ({
  center = false,
  className,
  children,
  ...props
}) => {
  const classes = [styles.zstack, center ? styles.centered : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
