import React from 'react';
import styles from './Stack.module.css';
import { SPACING_SCALE, type SpacingKey } from './spacing';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: SpacingKey | number | string;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export const HStack: React.FC<HStackProps> = ({
  gap = 'sm',
  align = 'center',
  justify = 'start',
  wrap = false,
  textAlign,
  className,
  style,
  children,
  ...props
}) => {
  const resolvedGap =
    typeof gap === 'string' && gap in SPACING_SCALE ? SPACING_SCALE[gap as SpacingKey] : gap;

  const classes = [
    styles.hstack,
    styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`],
    styles[`justify${justify.charAt(0).toUpperCase() + justify.slice(1)}`],
    wrap ? styles.wrap : '',
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
