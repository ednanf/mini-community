import React from 'react';
import styles from './Stack.module.css';
import { SPACING_SCALE, type SpacingKey } from './spacing';

interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: SpacingKey | number | string;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  margin?: SpacingKey | number | string;
  padding?: SpacingKey | number | string;
}

export const HStack: React.FC<HStackProps> = ({
  gap = 'sm',
  align = 'center',
  justify = 'start',
  wrap = false,
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
    styles.hstack,
    styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`],
    styles[`justify${justify.charAt(0).toUpperCase() + justify.slice(1)}`],
    wrap ? styles.wrap : '',
    textAlign ? styles[`textAlign${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const componentStyle = {
    gap: resolveSpacing(gap),
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
