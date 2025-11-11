import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { VStack } from '../Layout/VStack.tsx';
import { HStack } from '../Layout/HStack.tsx';
import styles from './UserCard.module.css';
import PillButton from '../Buttons/PillButton/PillButton.tsx';
import PillButtonLink from '../Buttons/PillButtonLink/PillButtonLink.tsx';
import { useEffect, useState } from 'react';
import { getUnwrapped, postUnwrapped } from '../../utils/axiosInstance.ts';

interface UserCardProps {
    nickname: string;
    avatarUrl?: string;
    bio?: string;
    onclick?: () => void;
}

type Response = {
    message: string;
    isFollowing: boolean;
};

const UserCard = ({ nickname, bio, avatarUrl }: UserCardProps) => {
    const location = useLocation();
    const { userId } = useParams<{ userId: string }>();
    const authenticatedUserId = localStorage.getItem('id');
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const checkFollowing = async () => {
            const response: Response = await getUnwrapped(
                `/users/${userId}/is-following`,
            );
            setIsFollowing(response.isFollowing);
        };

        if (location.pathname !== '/my-profile') {
            checkFollowing().catch(() => {
                toast.error('Failed to check following status.');
            });
        }
    }, [userId, location.pathname]);

    const followHandler = async () => {
        try {
            await postUnwrapped(`/users/follow/${userId}`);
            setIsFollowing(true);
        } catch (error) {
            toast.error('Failed to follow user. Please try again.');
            console.error('Error following user:', error);
        }
    };

    const unfollowHandler = async () => {
        try {
            await postUnwrapped(`/users/unfollow/${userId}`);
            setIsFollowing(false);
        } catch (error) {
            toast.error('Failed to unfollow user. Please try again.');
            console.error('Error unfollowing user:', error);
        }
    };

    return (
        <VStack gap={'lg'} padding={'md'} className={styles.cardBody}>
            <HStack justify={'between'}>
                <HStack gap={'sm'}>
                    <div className={styles.avatarWrapper}>
                        <img
                            src={avatarUrl}
                            alt={'User Avatar'}
                            className={styles.avatar}
                        />
                    </div>
                    <p style={{ fontWeight: '600' }}>@{nickname}</p>
                </HStack>
                {location.pathname !== '/my-profile' &&
                    !isFollowing &&
                    userId !== authenticatedUserId && (
                        <PillButton type="button" handleClick={followHandler}>
                            Follow
                        </PillButton>
                    )}
                {location.pathname !== '/my-profile' &&
                    isFollowing &&
                    userId !== authenticatedUserId && (
                        <PillButton type="button" handleClick={unfollowHandler}>
                            Unfollow
                        </PillButton>
                    )}
                {location.pathname === '/my-profile' ||
                    (userId === authenticatedUserId && (
                        <PillButtonLink to={'../edit-profile'}>
                            Edit Profile
                        </PillButtonLink>
                    ))}
            </HStack>
            {bio ? <p>{bio}</p> : <p>No bio available</p>}
        </VStack>
    );
};
export default UserCard;
