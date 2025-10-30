import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps {
    label?: string;
    maxLength: number;
    value: string;
    placeholder: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    characterCount: number;
    rows?: number;
}

const TextArea = ({
    label,
    maxLength,
    value,
    placeholder,
    onChange,
    characterCount,
    rows = 5,
}: TextAreaProps) => {
    return (
        <div className={styles.textAreaContainer}>
            {label ? <p className={styles.label}>{label}</p> : null}
            <textarea
                maxLength={maxLength}
                className={styles.textInput}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                rows={rows}
            />
            <div className={styles.textCounter}>
                {characterCount}/{maxLength}
            </div>
        </div>
    );
};
export default TextArea;
