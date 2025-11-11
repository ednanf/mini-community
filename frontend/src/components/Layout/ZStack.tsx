import React from 'react';
import styles from './Stack.module.css';
import { SPACING_SCALE, type SpacingKey } from './spacing';

interface ZStackProps extends React.HTMLAttributes<HTMLDivElement> {
  center?: boolean; // centers all children
  textAlign?: 'left' | 'center' | 'right';
  margin?: SpacingKey | number | string;
  padding?: SpacingKey | number | string;
}

export const ZStack: React.FC<ZStackProps> = ({
  center = false,
  textAlign,
  margin,
  padding,
  className,
  style,
  children,
  ...props
}) => {
  const resolveSpacing = (value: SpacingKey | number | string | undefined) =>
    typeof value === 'string' && value in SPACING_SCALE
      ? SPACING_SCALE[value as SpacingKey]
      : value;

  const classes = [
    styles.zstack,
    center ? styles.centered : '',
    textAlign ? styles[`textAlign${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const componentStyle = {
    margin: resolveSpacing(margin),
    padding: resolveSpacing(padding),
    ...style,
  };

  return (
    <div className={classes} style={componentStyle} {...props}>
      {children}
    </div>
  );
};
