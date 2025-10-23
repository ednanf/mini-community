import { useLocation } from 'react-router-dom';

import { VStack } from '../Layout/VStack.tsx';
import { HStack } from '../Layout/HStack.tsx';
import styles from './UserCard.module.css';
import PillButton from '../Buttons/PillButton/PillButton.tsx';
import PillButtonLink from '../Buttons/PillButtonLink/PillButtonLink.tsx';

interface UserCardProps {
    nickname: string;
    avatarUrl?: string;
    bio?: string;
    onclick?: () => void;
}

const UserCard = ({ nickname, bio, avatarUrl, onclick }: UserCardProps) => {
    const location = useLocation();

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
                {location.pathname !== '/my-profile' && onclick && (
                    <PillButton type="button" handleClick={onclick}>
                        Follow
                    </PillButton>
                )}
                {location.pathname === '/my-profile' && (
                    <PillButtonLink to={'../edit-profile'}>
                        Edit Profile
                    </PillButtonLink>
                )}
            </HStack>
            {bio ? <p>{bio}</p> : <p>No bio available</p>}
        </VStack>
    );
};
export default UserCard;
