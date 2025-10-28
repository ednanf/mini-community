import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack } from '../../components/Layout/VStack.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import { postUnwrapped } from '../../utils/axiosInstance.ts';
import PillButton from '../../components/Buttons/PillButton/PillButton.tsx';
import styles from './NewPost.module.css';

type ApiError = {
    message: string;
};

const NewPost = () => {
    const [text, setText] = useState('');
    const [textCount, setTextCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputText = event.target.value;
        setText(inputText);
        setTextCount(inputText.length);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsLoading(true);

        try {
            const payload = { postContent: text };

            await postUnwrapped('/posts', payload);

            toast.success('Post submitted successfully!');

            setText('');
            setTextCount(0);

            navigate('/my-feed');
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(
                apiError.message || 'Something went wrong. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <VStack align={'center'} margin={'md'}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                    maxLength={140}
                    className={styles.textInput}
                    value={text}
                    placeholder={"What's on your mind?"}
                    onChange={handleChange}
                    rows={5}
                />
                <div className={styles.textCounter}>{textCount}/140</div>

                <HStack align={'center'} justify={'center'}>
                    {' '}
                    <PillButton
                        type={'submit'}
                        disabled={isLoading || textCount === 0}
                    >
                        {isLoading ? 'Submitting...' : 'Tell the world!'}
                    </PillButton>
                </HStack>
            </form>
        </VStack>
    );
};
export default NewPost;
