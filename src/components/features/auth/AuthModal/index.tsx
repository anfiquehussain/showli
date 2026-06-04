import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useRedux';
import { closeModal, setModalMode } from '@/store/slices/authSlice';
import Modal from '@/components/patterns/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export const AuthModal = () => {
  const dispatch = useAppDispatch();
  const { isModalOpen, modalMode, isLoading, login, register, signInWithGoogle } = useAuth();

  const toggleMode = () => {
    dispatch(setModalMode(modalMode === 'login' ? 'register' : 'login'));
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => dispatch(closeModal())}
      title={modalMode === 'login' ? 'Welcome Back' : 'Create Account'}
    >
      {modalMode === 'login' ? (
        <LoginForm
          isLoading={isLoading}
          onSubmit={login}
          onGoogleSignIn={signInWithGoogle}
          onToggleMode={toggleMode}
        />
      ) : (
        <RegisterForm
          isLoading={isLoading}
          onSubmit={register}
          onGoogleSignIn={signInWithGoogle}
          onToggleMode={toggleMode}
        />
      )}
    </Modal>
  );
};

export default AuthModal;
