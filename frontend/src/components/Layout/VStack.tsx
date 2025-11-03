import React from 'react';
import styles from './Stack.module.css';
import { SPACING_SCALE, type SpacingKey } from './spacing';

interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
    gap?: SpacingKey | number | string;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    textAlign?: 'left' | 'center' | 'right';
    margin?: SpacingKey | number | string;
    padding?: SpacingKey | number | string;
    flexGrow?: boolean;
}

export const VStack: React.FC<VStackProps> = ({
    gap = 'sm',
    align = 'stretch',
    justify = 'start',
    textAlign,
    margin,
    padding,
    flexGrow,
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
        styles.vstack,
        align !== 'stretch'
            ? styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`]
            : '',
        styles[`justify${justify.charAt(0).toUpperCase() + justify.slice(1)}`],
        textAlign
            ? styles[
                  `textAlign${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`
              ]
            : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const componentStyle = {
        gap: resolveSpacing(gap),
        margin: resolveSpacing(margin),
        padding: resolveSpacing(padding),
        flexGrow: flexGrow ? 1 : undefined,
        ...style,
    };

    return (
        <div className={classes} style={componentStyle} {...props}>
            {children}
        </div>
    );
};
