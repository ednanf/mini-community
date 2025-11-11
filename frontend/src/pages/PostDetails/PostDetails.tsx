import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUnwrapped, postUnwrapped } from '../../utils/axiosInstance.ts';
import { VStack } from '../../components/Layout/VStack.tsx';
import { HStack } from '../../components/Layout/HStack.tsx';
import PostCard from '../../components/PostCard/PostCard.tsx';
import Loader from '../../components/Loader/Loader.tsx';
import TextArea from '../../components/Forms/TextArea/TextArea.tsx';
import PillButton from '../../components/Buttons/PillButton/PillButton.tsx';
import userPlaceholder from '../../assets/user-placeholder.png';
import styles from './PostDetails.module.css';
import Separator from '../../components/Separator/Separator.tsx';

type Post = {
    _id: string;
    createdBy: {
        _id: string;
        nickname: string;
    };
    postContent: string;
    postComments: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
};

type Comment = {
    _id: string;
    createdBy: {
        _id: string;
        nickname: string;
    };
    commentContent: string;
    createdAt: string;
};

type PostResponse = {
    message: string;
    postContent: Post;
};

type PaginatedCommentsResponse = {
    message: string;
    comments: Comment[];
    nextCursor: string | null;
};

type CommentCreateResponse = {
    message: string;
    commentContent: Comment;
};

type RouteParams = {
    postId: string;
};

const PostDetails = () => {
    const { postId } = useParams<RouteParams>();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_error, setError] = useState<string | null>(null);

    // Comment form state
    const [commentText, setCommentText] = useState<string>('');
    const [commentTextCount, setCommentTextCount] = useState<number>(0);
    const [isSubmittingComment, setIsSubmittingComment] =
        useState<boolean>(false);

    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const fetchPostDetails = async () => {
            if (!postId) return;
            setIsInitialLoading(true);
            setError(null);

            try {
                // Fetch the post
                const postResponse = await getUnwrapped<PostResponse>(
                    `/posts/${postId}`,
                );
                setPost(postResponse.postContent);

                // Fetch initial comments
                const params = new URLSearchParams();
                params.append('limit', '10');

                const commentsResponse =
                    await getUnwrapped<PaginatedCommentsResponse>(
                        `/posts/${postId}/comments?${params.toString()}`,
                    );

                setComments(commentsResponse.comments);
                setCursor(commentsResponse.nextCursor);
                setHasMore(!!commentsResponse.nextCursor);
            } catch (error: unknown) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred';
                setError(message);
                toast.error(message);
            } finally {
                setIsInitialLoading(false);
            }
        };

        void fetchPostDetails();
    }, [postId]);

    const fetchMoreComments = useCallback(async () => {
        if (isLoadingMore || !hasMore || !cursor || !postId) return;

        setIsLoadingMore(true);

        try {
            const params = new URLSearchParams();
            params.append('limit', '10');
            params.append('cursor', cursor);

            const response = await getUnwrapped<PaginatedCommentsResponse>(
                `/posts/${postId}/comments?${params.toString()}`,
            );

            setComments((prevComments) => [
                ...prevComments,
                ...response.comments,
            ]);
            setCursor(response.nextCursor);
            setHasMore(!!response.nextCursor);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred';
            toast.error(message);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, cursor, postId]);

    const loaderRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoadingMore) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    void fetchMoreComments();
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoadingMore, fetchMoreComments],
    );

    const handleCommentChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const inputText = event.target.value;
        setCommentText(inputText);
        setCommentTextCount(inputText.length);
    };

    const handleCommentSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!postId || commentText.trim().length === 0) return;

        setIsSubmittingComment(true);

        try {
            const payload = { commentContent: commentText };

            const response = await postUnwrapped<CommentCreateResponse>(
                `/posts/${postId}/comments`,
                payload,
            );

            // Reconstruct the comment with the current user's info from localStorage
            const currentUserId = localStorage.getItem('id');
            const currentUserNickname = localStorage.getItem('nickname');

            const newComment: Comment = {
                _id: response.commentContent._id,
                createdBy: {
                    _id:
                        currentUserId ||
                        String(response.commentContent.createdBy),
                    nickname: currentUserNickname || 'Unknown',
                },
                commentContent: response.commentContent.commentContent,
                createdAt: response.commentContent.createdAt,
            };

            // Add the new comment to the beginning of the comments list
            setComments((prevComments) => [newComment, ...prevComments]);

            toast.success('Comment posted successfully!');

            // Reset form
            setCommentText('');
            setCommentTextCount(0);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to post comment. Please try again.';
            toast.error(message);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return (
        <VStack align={'center'} gap={'sm'} margin={'md'}>
            {isInitialLoading && !post ? (
                <VStack
                    justify={'center'}
                    align={'center'}
                    style={{ minHeight: '80vh' }}
                >
                    <Loader />
                </VStack>
            ) : post ? (
                <>
                    {/* Parent Post */}
                    <PostCard
                        image={userPlaceholder}
                        nickname={post.createdBy.nickname}
                        authorId={post.createdBy._id}
                        postBody={post.postContent}
                        date={post.createdAt}
                        postId={post._id}
                        isParentPost={true}
                    />

                    {/* Comment Form */}
                    <form
                        onSubmit={handleCommentSubmit}
                        className={styles.commentForm}
                    >
                        <TextArea
                            maxLength={140}
                            value={commentText}
                            placeholder={'Contribute to the discussion...'}
                            onChange={handleCommentChange}
                            characterCount={commentTextCount}
                            rows={3}
                        />

                        <HStack align={'center'} justify={'center'}>
                            <PillButton
                                type={'submit'}
                                disabled={
                                    isSubmittingComment ||
                                    commentTextCount === 0
                                }
                            >
                                {isSubmittingComment
                                    ? 'Posting...'
                                    : 'Post Comment'}
                            </PillButton>
                        </HStack>
                    </form>

                    <Separator />

                    {/* Comment Cards */}
                    {comments.map((comment) => (
                        <PostCard
                            key={comment._id}
                            image={userPlaceholder}
                            nickname={comment.createdBy.nickname}
                            authorId={comment.createdBy._id}
                            postBody={comment.commentContent}
                            date={comment.createdAt}
                            postId={comment._id}
                            isComment={true}
                        />
                    ))}

                    {/* Loading animation for pagination */}
                    {hasMore && (
                        <div ref={loaderRef}>
                            <VStack
                                justify={'center'}
                                align={'center'}
                                style={{
                                    marginBottom: '4rem',
                                    marginTop: '1rem',
                                }}
                            >
                                <Loader />
                            </VStack>
                        </div>
                    )}
                </>
            ) : (
                <p>Post not found.</p>
            )}
        </VStack>
    );
};
export default PostDetails;
