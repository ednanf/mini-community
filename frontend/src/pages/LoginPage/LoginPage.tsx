import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from '../../assets/logo-no-bg.png';
import InputField from '../../components/InputField/InputField.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import { VStack } from '../../components/Layout/VStack.tsx';
import PillButton from '../../components/PillButton/PillButton.tsx';
import { postUnwrapped } from '../../utils/axiosInstance.ts';
import styles from './LoginPage.module.css';

type FormData = {
    email: string;
    password: string;
};

type LoginResponse = {
    message: string;
    nickname: string;
    email: string;
    token: string;
};

type ApiError = {
    message: string;
};

const LoginPage = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<Partial<FormData>>({
        email: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Check if all form fields are filled
    const isFormReady = () => {
        return formData.email.trim() !== '' && formData.password.trim() !== '';
    };

    // Validate form data
    const validate = (data: FormData) => {
        const newErrors: FormData = {
            email: '',
            password: '',
        };
        if (!data.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!data.password) {
            newErrors.password = 'Password is required';
        }
        return newErrors;
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset errors
        setErrors({
            email: '',
            password: '',
        });

        // Basic validation - Zod will validate on the backend
        // This is just to provide immediate feedback to the user
        const validationErrors = validate(formData);
        if (validationErrors.email || validationErrors.password) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await postUnwrapped<LoginResponse>(
                'auth/login',
                formData,
            );

            localStorage.setItem('nickname', response.nickname);
            localStorage.setItem('email', response.email);
            localStorage.setItem('token', response.token);

            // Dispatch a custom event to notify other parts of the app about the local storage change
            // Needed for things like showing the correct nav bar options
            window.dispatchEvent(new Event('local-storage'));

            toast.success('Welcome back!');

            navigate('/global-feed');
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(
                apiError.message || 'Registration failed. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <VStack align={'center'}>
                <img src={logo} alt="Logo" width={100} />
            </VStack>

            <form onSubmit={handleSubmit}>
                <VStack
                    margin={'lg'}
                    padding={'md'}
                    gap={'lg'}
                    style={{ maxWidth: '400px', margin: 'auto' }}
                >
                    <InputField
                        label={'Email'}
                        id={'email'}
                        name={'email'}
                        type={'email'}
                        value={formData.email}
                        onChange={handleChange}
                        required={true}
                        error={errors.email}
                    />

                    <InputField
                        label={'Password'}
                        id={'password'}
                        name={'password'}
                        type={'password'}
                        value={formData.password}
                        onChange={handleChange}
                        required={true}
                        error={errors.password}
                    />

                    <HStack justify={'center'} margin={30}>
                        <PillButton
                            type="submit"
                            handleClick={() => {}}
                            disabled={isLoading || !isFormReady()}
                        >
                            Login
                        </PillButton>
                    </HStack>
                </VStack>
            </form>

            <VStack align={'center'}>
                <p className={styles.footerText}>
                    Don't have an account?{' '}
                    <Link to={'../register'} className={styles.link}>
                        Create one here
                    </Link>
                </p>
            </VStack>
        </>
    );
};
export default LoginPage;
