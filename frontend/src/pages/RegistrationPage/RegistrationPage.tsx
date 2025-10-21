import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from '../../assets/logo-no-bg.png';
import InputField from '../../components/InputField/InputField.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import { VStack } from '../../components/Layout/VStack.tsx';
import PillButton from '../../components/PillButton/PillButton.tsx';
import { postUnwrapped } from '../../utils/axiosInstance.ts';
import styles from './RegistrationPage.module.css';

type FormData = {
    nickname: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type RegistrationResponse = {
    message: string;
    nickname: string;
    email: string;
    token: string;
};

type ApiError = {
    message: string;
};

const RegistrationPage = () => {
    const [formData, setFormData] = useState<FormData>({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<FormData>>({
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Check if all form fields are filled
    const isFormReady = () => {
        return (
            formData.nickname.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.trim() !== '' &&
            formData.confirmPassword.trim() !== ''
        );
    };

    // Validate form data
    const validate = (data: FormData) => {
        const newErrors: FormData = {
            nickname: '',
            email: '',
            password: '',
            confirmPassword: '',
        };
        if (!data.nickname) {
            newErrors.nickname = 'Nickname is required';
        }
        if (!data.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!data.password) {
            newErrors.password = 'Password is required';
        }
        if (!data.confirmPassword) {
            newErrors.confirmPassword = 'Password confirmation is required';
        }
        if (data.password !== data.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate password confirmation
        if (name === 'password' || name === 'confirmPassword') {
            const password = name === 'password' ? value : formData.password;
            const confirmPassword =
                name === 'confirmPassword' ? value : formData.confirmPassword;

            if (confirmPassword && password !== confirmPassword) {
                setErrors({
                    ...errors,
                    confirmPassword: 'Passwords do not match',
                });
            } else {
                setErrors({ ...errors, confirmPassword: '' });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset errors
        setErrors({
            nickname: '',
            email: '',
            password: '',
            confirmPassword: '',
        });

        // Basic validation - Zod will validate on the backend
        // This is just to provide immediate feedback to the user
        const validationErrors = validate(formData);
        if (
            validationErrors.nickname ||
            validationErrors.email ||
            validationErrors.password ||
            validationErrors.confirmPassword
        ) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await postUnwrapped<RegistrationResponse>(
                'auth/register',
                formData,
            );

            localStorage.setItem('nickname', response.nickname);
            localStorage.setItem('email', response.email);
            localStorage.setItem('token', response.token);

            // Dispatch a custom event to notify other parts of the app about the local storage change
            // Needed for things like showing the correct nav bar options
            window.dispatchEvent(new Event('local-storage'));

            toast.success('Welcome aboard!');

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
                        label={'Nickname'}
                        id={'nickname'}
                        name={'nickname'}
                        type={'text'}
                        value={formData.nickname}
                        onChange={handleChange}
                        required={true}
                        error={errors.nickname}
                    />

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

                    <InputField
                        label={'Confirm Password'}
                        id={'confirmPassword'}
                        name={'confirmPassword'}
                        type={'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={true}
                        error={errors.confirmPassword}
                    />

                    <HStack justify={'center'} margin={30}>
                        <PillButton
                            type="submit"
                            handleClick={() => {}}
                            disabled={isLoading || !isFormReady()}
                        >
                            Register
                        </PillButton>
                    </HStack>
                </VStack>
            </form>

            <VStack align={'center'}>
                <p className={styles.footerText}>
                    Already have an account?{' '}
                    <Link to={'../login'} className={styles.link}>
                        Log in here
                    </Link>
                </p>
            </VStack>
        </>
    );
};
export default RegistrationPage;
