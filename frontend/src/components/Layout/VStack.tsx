import React from 'react';
import styles from './Stack.module.css';
import { SPACING_SCALE, type SpacingKey } from './spacing';

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: SpacingKey | number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  textAlign?: 'left' | 'center' | 'right';
}

export const VStack: React.FC<VStackProps> = ({
  gap = 'sm',
  align = 'stretch',
  justify = 'start',
  textAlign,
  className,
  style,
  children,
  ...props
}) => {
  const resolvedGap =
    typeof gap === 'string' && gap in SPACING_SCALE ? SPACING_SCALE[gap as SpacingKey] : gap;

  const classes = [
    styles.vstack,
    align !== 'stretch' ? styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`] : '',
    styles[`justify${justify.charAt(0).toUpperCase() + justify.slice(1)}`],
    textAlign ? styles[`textAlign${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={{ gap: resolvedGap, ...style }} {...props}>
      {children}
    </div>
  );
};
