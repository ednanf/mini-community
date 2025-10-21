import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa6';

import styles from './BackButton.module.css';

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Goes back one step in the history stack
  };

  return (
    <button onClick={handleGoBack} type="button" className={styles.button}>
      <FaChevronLeft />
    </button>
  );
};
export default BackButton;
