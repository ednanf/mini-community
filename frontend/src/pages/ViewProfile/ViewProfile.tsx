import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { VStack } from '../../components/Layout/VStack.tsx';
import { getUnwrapped } from '../../utils/axiosInstance.ts';

import UserCard from '../../components/UserCard/UserCard.tsx';
import PostCard from '../../components/PostCard/PostCard.tsx';
import Loader from '../../components/Loader/Loader.tsx';

import userPlaceholder from '../../assets/user-placeholder.png';
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

type User = {
    id: string;
    nickname: string;
    email: string;
    bio: string;
    avatarUrl: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
};

type PaginatedResponse = {
    message: string;
    posts: Post[];
    nextCursor: string | null;
};

type RouteParams = {
    userId: string;
};

const ViewProfile = () => {
    const { userId } = useParams<RouteParams>(); // Grab profileId from route params

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_error, setError] = useState<string | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);

    // Stabilize fetchMoreEntries with useCallback.
    const fetchMorePosts = useCallback(async () => {
        // Prevent fetching if already loading or no more posts
        if (isLoading || !hasMore || !cursor) return;

        setIsLoading(true);

        try {
            // Set up query parameters
            const params = new URLSearchParams();
            params.append('limit', '10'); // Consistent limit for pagination.
            params.append('cursor', cursor); // Use the cursor from state.

            // Make the API call
            const response = await getUnwrapped<PaginatedResponse>(
                `/posts/user/${userId}/?${params.toString()}`,
            );

            // Append new posts to existing posts
            setPosts((prevPosts) => [...prevPosts, ...response.posts]);

            // Update cursor and hasMore based on response
            setCursor(response.nextCursor);
            setHasMore(!!response.nextCursor);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, cursor, userId]);

    // Use useCallback to memoize the loaderRef function, ensuring it does not change on every render.
    // This prevents unnecessary re-creations of the IntersectionObserver.
    const loaderRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading) return; // Prevent setting up observer if already loading.
            if (observer.current) observer.current.disconnect(); // Disconnect previous observer if it exists.

            // Create a new IntersectionObserver instance.
            // This ensures that the observer is stable and does not change on every render.
            // The observer will only trigger fetchMoreEntries when the loader is intersecting.
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    // Call the stable fetchMoreEntries function.
                    void fetchMorePosts();
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoading, fetchMorePosts], // The dependency array is now correct and stable.
    );

    // Initial fetch of posts when component mounts.
    useEffect(() => {
        let ignore = false;

        setIsLoading(true);
        setInitialLoading(true);
        setError(null);

        const fetchInitialPosts = async () => {
            try {
                const params = new URLSearchParams();
                params.append('limit', '10');

                const response = await getUnwrapped<PaginatedResponse>(
                    `/posts/user/${userId}?${params.toString()}`,
                );

                const responseUser = await getUnwrapped<User>(
                    `/users/${userId}`,
                );

                if (!ignore) {
                    setUser(responseUser);
                    setPosts(response.posts);
                    setCursor(response.nextCursor);
                    setHasMore(!!response.nextCursor);
                }
            } catch (error: unknown) {
                if (!ignore) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : 'Failed to fetch posts.';
                    setError(message);
                    toast.error(message);
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                    setInitialLoading(false);
                }
            }
        };

        void fetchInitialPosts();

        return () => {
            ignore = true;
        };
    }, [userId]);

    return (
        <VStack align={'center'} gap={'sm'} margin={'md'}>
            {posts.length === 0 && initialLoading ? (
                <VStack
                    justify={'center'}
                    align={'center'}
                    /* Make the loader container take the full viewport height so centering works */
                    style={{ minHeight: '80vh' }}
                >
                    <Loader />
                </VStack>
            ) : (
                <>
                    {user && (
                        <UserCard
                            nickname={user.nickname}
                            bio={user?.bio}
                            avatarUrl={userPlaceholder}
                        />
                    )}

                    <Separator />

                    {posts.map((p) => (
                        <PostCard
                            key={p._id}
                            image={userPlaceholder}
                            nickname={p.createdBy.nickname}
                            postBody={p.postContent}
                            date={p.createdAt}
                            authorId={p.createdBy._id}
                            postId={p._id}
                        />
                    ))}

                    {hasMore && (
                        <div ref={loaderRef}>
                            <VStack
                                justify={'center'}
                                align={'center'}
                                style={{ marginBottom: '4rem' }}
                            >
                                <Loader />
                            </VStack>
                        </div>
                    )}
                </>
            )}
        </VStack>
    );
};
export default ViewProfile;
