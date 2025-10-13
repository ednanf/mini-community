import { Request, Response, NextFunction } from 'express';

const getPosts = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'Get all posts' });
};

const createPost = (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json({ message: 'Create a new post' });
};

const getPostById = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    res.status(200).json({ message: `Get post with ID: ${id}` });
};

const deletePost = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    res.status(200).json({ message: `Delete post with ID: ${id}` });
};

export { getPosts, createPost, getPostById, deletePost };
