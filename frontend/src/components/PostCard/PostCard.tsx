import { Link } from 'react-router-dom';
import { VStack } from '../Layout/VStack.tsx';
import { HStack } from '../Layout/HStack.tsx';
import mongodbDateFormatter from '../../utils/mongodbDateFormatter.ts';
import styles from './PostCard.module.css';

interface PostCardProps {
    image: string;
    nickname: string;
    authorId: string;
    postBody: string;
    date: string;
}

// TODO: Limit width of post card on larger screens and add word wrap for long words
// **might need to adjust all feeds to center cards properly

const PostCard = ({
    image,
    nickname,
    authorId,
    postBody,
    date,
}: PostCardProps) => {
    const formattedDate = mongodbDateFormatter(date);

    return (
        <div className={styles.cardBody}>
            <HStack padding={'sm'} gap={'md'}>
                <img
                    src={image}
                    alt={'profile picture'}
                    className={styles.profileImage}
                />
                <VStack style={{ minWidth: '0' }}>
                    <div className={styles.nickname}>
                        <Link
                            to={`../profile/${authorId}`}
                            className={styles.nickname}
                        >
                            @{nickname}
                        </Link>
                    </div>
                    <p className={styles.postBody}>{postBody}</p>
                    <HStack>
                        <p className={styles.timestamp}>{formattedDate}</p>
                    </HStack>
                </VStack>
            </HStack>
        </div>
    );
};
export default PostCard;
