import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VStack } from '../../components/Layout/VStack.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import { getUnwrapped, patchUnwrapped } from '../../utils/axiosInstance.ts';
import InputField from '../../components/Forms/InputField/InputField.tsx';
import PillButton from '../../components/Buttons/PillButton/PillButton.tsx';
import TextArea from '../../components/Forms/TextArea/TextArea.tsx';
import Loader from '../../components/Loader/Loader.tsx';

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
    const [formData, setFormData] = useState<FormData | null>(null);
    const [errors, setErrors] = useState<Partial<FormData>>({
        nickname: '',
        email: '',
        bio: '',
    });
    const [initialLoading, setInitialLoading] = useState(true);
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
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserData().catch((error) => console.error(error));
    }, []);

    const validate = (data: FormData) => {
        const newErrors: Partial<FormData> = {};
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Invalid email format';
        }
        return newErrors;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTextAreaChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const inputText = event.target.value;
        setFormData((prev) => ({ ...prev, bio: inputText }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData) return;

        setErrors({});

        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
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
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Update failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <VStack
                justify={'center'}
                align={'center'}
                style={{ minHeight: '80vh' }}
            >
                <Loader />
            </VStack>
        );
    }

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
                    value={formData?.nickname || ''}
                    onChange={handleInputChange}
                    error={errors.nickname}
                />
                <InputField
                    type={'email'}
                    label={'New email'}
                    id={'email'}
                    name={'email'}
                    placeholder={currentUserEmail || ''}
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                    error={errors.email}
                    required={false}
                />
                <TextArea
                    label={'Bio'}
                    maxLength={140}
                    value={formData?.bio || ''}
                    placeholder={'Tell everyone about yourself...'}
                    onChange={handleTextAreaChange}
                    characterCount={formData?.bio?.length || 0}
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
