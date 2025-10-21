import PostCard from '../../components/PostCard/PostCard.tsx';
import { VStack } from '../../components/Layout/VStack.tsx';

import userPlaceholder from '../../assets/user-placeholder.png';

const testData = {
    message: 'Posts retrieved successfully',
    posts: [
        {
            _id: '68f78886272a4cd40f6aa4ef',
            createdBy: {
                _id: '68f7794a289bba062bb644c5',
                nickname: 'test',
            },
            postContent: 'This too is a post by user: Test',
            postComments: [
                '68f788a1272a4cd40f6aa4f5',
                '68f788a8272a4cd40f6aa4f8',
            ],
            createdAt: '2025-10-21T13:20:06.664Z',
            updatedAt: '2025-10-21T13:20:40.328Z',
            __v: 0,
        },
        {
            _id: '68f7887a272a4cd40f6aa4ed',
            createdBy: {
                _id: '68f7794a289bba062bb644c5',
                nickname: 'test',
            },
            postContent: 'This is a post by user: Test',
            postComments: [],
            createdAt: '2025-10-21T13:19:54.567Z',
            updatedAt: '2025-10-21T13:19:54.567Z',
            __v: 0,
        },
    ],
    nextCursor: null,
};

const GlobalFeed = () => {
    return (
        <VStack>
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
            <PostCard image={userPlaceholder} />
        </VStack>
    );
};
export default GlobalFeed;
