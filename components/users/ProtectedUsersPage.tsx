import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api';
import { useApiError } from '../../hooks/useApiError';
import UsersPage from './UsersPage';

/**
 * Protected wrapper for UsersPage - only allows Administrator and TeamLeader
 */
const ProtectedUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const handleApiError = useApiError();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await authService.getMe();
        
        // Only Administrator and TeamLeader can access Users page
        if (user.role !== 'Administrator' && user.role !== 'TeamLeader') {
          // Redirect to dashboard if not authorized
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        handleApiError(err);
        navigate('/login', { replace: true });
      }
    };

    checkAccess();
  }, [navigate, handleApiError]);

  return <UsersPage />;
};

export default ProtectedUsersPage;

