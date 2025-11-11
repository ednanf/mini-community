import { Link } from 'react-router-dom';
import { TbMessageReply } from 'react-icons/tb';
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
    postId: string;
    isParentPost?: boolean;
    isComment?: boolean;
}

const PostCard = ({
    image,
    nickname,
    authorId,
    postBody,
    date,
    postId,
    isParentPost = false,
    isComment = false,
}: PostCardProps) => {
    const formattedDate = mongodbDateFormatter(date);

    // Hide reply button if it's a parent post or a comment in PostDetails
    const showReplyButton = !isParentPost && !isComment;

    return (
        <div className={styles.cardBody}>
            <HStack padding={'sm'} gap={'md'}>
                <img
                    src={image}
                    alt={'profile picture'}
                    className={styles.profileImage}
                />
                <VStack flexGrow style={{ minWidth: '0' }}>
                    <div className={styles.nickname}>
                        <Link
                            to={`../profile/${authorId}`}
                            className={styles.nickname}
                        >
                            @{nickname}
                        </Link>
                    </div>
                    <p className={styles.postBody}>{postBody}</p>
                    <HStack align={'center'} justify={'between'}>
                        <p className={styles.timestamp}>{formattedDate}</p>
                        {showReplyButton && (
                            <Link
                                to={`/posts/${postId}`}
                                className={styles.commentButton}
                            >
                                <TbMessageReply />
                            </Link>
                        )}
                    </HStack>
                </VStack>
            </HStack>
        </div>
    );
};
export default PostCard;
