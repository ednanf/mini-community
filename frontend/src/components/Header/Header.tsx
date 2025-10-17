import React from 'react';
import { HStack } from '../Layout/HStack.tsx';
import BackButton from '../BackButton/BackButton.tsx';

interface HeaderProps {
  backButton: boolean;
  children: React.ReactNode;
}

const Header = ({ backButton, children }: HeaderProps) => {
  return (
    <HStack>
      {backButton ? <BackButton /> : ''}
      {children}
    </HStack>
  );
};
export default Header;
