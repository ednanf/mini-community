import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteUnwrapped } from '../../utils/axiosInstance.ts';
import { VStack } from '../../components/Layout/VStack.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import PillButton from '../../components/Buttons/PillButton/PillButton.tsx';
import Separator from '../../components/Separator/Separator.tsx';
import styles from './Settings.module.css';

type ServerResponse = {
    message: string;
};

const Settings = () => {
    const { theme, toggleTheme } = useOutletContext<{
        theme: string;
        toggleTheme: () => void;
    }>();

    const navigate = useNavigate();

    const user = localStorage.getItem('email');

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event('local-storage')); // Force re-check of token, updating the UI
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        const ok = window.confirm(
            'This action is permanent. Delete your account?',
        );
        if (!ok) return;

        try {
            const response: ServerResponse = await deleteUnwrapped('/users/me');

            localStorage.clear();

            window.dispatchEvent(new Event('local-storage')); // Force re-check of token, updating the UI

            toast.success(response.message);

            navigate('/');
        } catch (error) {
            toast.error(
                `Failed to delete account: ${(error as Error).message}`,
            );
        }
    };

    return (
        <HStack align={'center'} justify={'center'}>
            <VStack
                justify={'center'}
                gap={'md'}
                margin={'md'}
                style={{ maxWidth: '400px', width: '100%' }}
            >
                <PillButton type={'button'} handleClick={toggleTheme}>
                    Switch to {theme === 'light' ? 'dark' : 'light'} mode
                </PillButton>
                <PillButton type={'button'} handleClick={handleLogout}>
                    Log out
                </PillButton>
                <PillButton
                    type={'button'}
                    handleClick={handleDeleteAccount}
                    color={'red'}
                >
                    Delete account
                </PillButton>

                <HStack
                    justify={'center'}
                    style={{ marginTop: '10px', marginBottom: '-10px' }}
                >
                    <p className={styles.footer}>Logged in as {user}</p>
                </HStack>

                <VStack align={'center'}>
                    <Separator />
                    <HStack>
                        <p className={styles.footer}>Version 1.0 - </p>
                        <a
                            href={'https://github.com/ednanf/mini-community'}
                            target={'_blank'}
                            rel={'noreferrer'}
                            className={styles.footer}
                        >
                            GitHub
                        </a>
                    </HStack>
                </VStack>
            </VStack>
        </HStack>
    );
};
export default Settings;
