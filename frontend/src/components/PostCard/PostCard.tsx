import { VStack } from '../Layout/VStack.tsx';
import { HStack } from '../Layout/HStack.tsx';
import mongodbDateFormatter from '../../utils/mongodbDateFormatter.ts';
import styles from './PostCard.module.css';

interface PostCardProps {
    image: string;
    nickname: string;
    postBody: string;
    date: string;
}

const PostCard = ({ image, nickname, postBody, date }: PostCardProps) => {
    const formattedDate = mongodbDateFormatter(date);

    return (
        <div className={styles.cardBody}>
            <HStack padding={'sm'} gap={'md'}>
                <img
                    src={image}
                    alt={'profile picture'}
                    className={styles.profileImage}
                />
                <VStack>
                    <p className={styles.nickname}>@{nickname}</p>
                    <p>{postBody}</p>
                    <HStack>
                        <p className={styles.timestamp}>{formattedDate}</p>
                    </HStack>
                </VStack>
            </HStack>
        </div>
    );
};
export default PostCard;
