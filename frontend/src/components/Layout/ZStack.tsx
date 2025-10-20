import React from 'react';
import styles from './Stack.module.css';

interface ZStackProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: boolean; // centers all children
  textAlign?: 'left' | 'center' | 'right';
}

export const ZStack: React.FC<ZStackProps> = ({
  center = false,
  textAlign,
  className,
  children,
  ...props
}) => {
  const classes = [
    styles.zstack,
    center ? styles.centered : '',
    textAlign ? styles[`textAlign${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
