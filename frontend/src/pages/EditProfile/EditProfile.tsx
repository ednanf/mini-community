import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack } from '../../components/Layout/VStack.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import { getUnwrapped, patchUnwrapped } from '../../utils/axiosInstance.ts';
import InputField from '../../components/Forms/InputField/InputField.tsx';
import PillButton from '../../components/Buttons/PillButton/PillButton.tsx';
import TextArea from '../../components/Forms/TextArea/TextArea.tsx';

type FormData = {
    nickname?: string;
    email?: string;
    bio?: string;
};

type ApiResponse = {
    message: string;
    nickname: string;
    email: string;
    bio: string;
    avatarUrl: string;
};

type ApiError = {
    message: string;
};

const EditProfile = () => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        nickname: '',
        bio: '',
    });

    const [errors, setErrors] = useState<Partial<FormData>>({
        nickname: '',
        email: '',
        bio: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const currentUserNickname = localStorage.getItem('nickname');
    const currentUserEmail = localStorage.getItem('email');
    const currentUserId = localStorage.getItem('id');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getUnwrapped<ApiResponse>('/auth/me');
                setFormData({
                    bio: response.bio,
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData().catch((error) => console.error(error));
    }, []);

    const validate = (data: FormData) => {
        const newErrors: FormData = {
            nickname: '',
            email: '',
            bio: '',
        };
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        return newErrors;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTextAreaChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const inputText = event.target.value;
        setFormData({ ...formData, bio: inputText });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setErrors({
            nickname: '',
            email: '',
            bio: '',
        });

        const validationErrors = validate(formData);
        if (validationErrors.email) {
            setErrors(validationErrors);
        }

        setIsLoading(true);

        try {
            const response: ApiResponse = await patchUnwrapped(
                '/users/me',
                formData,
            );

            localStorage.setItem('nickname', response.nickname);
            localStorage.setItem('email', response.email);

            toast.success('Profile updated successfully!');

            navigate(`/profile/${currentUserId}`);
        } catch (error) {
            // Handle error
            const apiError = error as ApiError;
            toast.error(
                apiError.message || 'Registration failed. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <VStack
                margin={'md'}
                gap={'lg'}
                align={'stretch'}
                style={{ maxWidth: '400px', width: '100%' }}
            >
                <InputField
                    type={'text'}
                    label={'New nickname'}
                    id={'nickname'}
                    name={'nickname'}
                    placeholder={currentUserNickname || ''}
                    value={formData.nickname ? formData.nickname : ''}
                    onChange={handleInputChange}
                    error={errors.nickname}
                />

                <InputField
                    type={'email'}
                    label={'New email'}
                    id={'email'}
                    name={'email'}
                    placeholder={currentUserEmail || ''}
                    value={formData.email ? formData.email : ''}
                    onChange={handleInputChange}
                    error={errors.email}
                    required={false}
                />

                <TextArea
                    label={'Bio'}
                    maxLength={140}
                    value={formData.bio ? formData.bio : ''}
                    placeholder={'Tell us about yourself...'}
                    onChange={handleTextAreaChange}
                    characterCount={formData.bio ? formData.bio.length : 0}
                    rows={5}
                />

                <HStack justify={'center'}>
                    <PillButton type={'submit'} disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update'}
                    </PillButton>
                </HStack>
            </VStack>
        </form>
    );
};
export default EditProfile;
