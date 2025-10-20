import { Link } from 'react-router-dom';
import { VStack } from '../../components/Layout/VStack.tsx';
import PillButtonLink from '../../components/PillButtonLink/PillButtonLink.tsx';
import logo from '../../assets/logo-no-bg.png';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <VStack justify={'center'} align={'center'} gap={'lg'} textAlign={'center'} margin={'sm'}>
      <img src={logo} alt="Logo" className={styles.logo} />
      <h2>Welcome to Mini Community</h2>
      <p>Your go-to platform for connecting with friends and sharing moments</p>
      <p>Join us today and start your journey!</p>
      <VStack justify={'center'} align={'center'} gap={'sm'} margin={'lg'}>
        <PillButtonLink to={'register'}>Get Started</PillButtonLink>
        <p>or</p>
        <Link to="/login" className={styles.loginLink}>
          Log In
        </Link>
      </VStack>
    </VStack>
  );
};
export default LandingPage;
