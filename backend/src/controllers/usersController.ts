import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

const registerUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).json({ msg: 'register user hit' });
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).json({ msg: 'login user hit' });
};

const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).json({ msg: 'logout user hit' });
};

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).json({ msg: 'delete user hit' });
};

export { registerUser, loginUser, logoutUser, deleteUser };
