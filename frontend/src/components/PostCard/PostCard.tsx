import React from 'react';
import styles from './PostCard.module.css';
import { VStack } from '../Layout/VStack.tsx';
import { HStack } from '../Layout/HStack.tsx';

const PostCard = ({ image }) => {
    return (
        <div className={styles.cardBody}>
            <HStack padding={'sm'} gap={'md'}>
                <img
                    src={image}
                    alt={'profile picture'}
                    className={styles.profileImage}
                />
                <VStack>
                    <p className={styles.nickname}>@test</p>
                    <p>My balls are itching</p>
                    <HStack>
                        <p className={styles.timestamp}>21 Oct 2025, 13:20</p>
                    </HStack>
                </VStack>
            </HStack>
        </div>
    );
};
export default PostCard;
