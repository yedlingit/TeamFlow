import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api';
import { useApiError } from '../../hooks/useApiError';
import { useLoading } from '../../hooks/useLoading';
import UsersPage from './UsersPage';
import { Loader2 } from 'lucide-react';

/**
 * Protected wrapper for UsersPage - only allows Administrator and TeamLeader
 */
const ProtectedUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const handleApiError = useApiError();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      startLoading();
      try {
        const user = await authService.getMe();
        
        // Map role if it's a number (fallback)
        const role = typeof user.role === 'number' 
          ? (user.role === 0 ? 'Member' : user.role === 1 ? 'TeamLeader' : 'Administrator')
          : user.role;
        
        // Only Administrator and TeamLeader can access Users page
        if (role !== 'Administrator' && role !== 'TeamLeader') {
          // Redirect to dashboard if not authorized
          navigate('/dashboard', { replace: true });
          setHasAccess(false);
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        handleApiError(err);
        navigate('/login', { replace: true });
        setHasAccess(false);
      } finally {
        stopLoading();
      }
    };

    checkAccess();
  }, [navigate, handleApiError, startLoading, stopLoading]);

  // Show loading while checking access
  if (hasAccess === null || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Only render UsersPage if access is granted
  if (hasAccess) {
    return <UsersPage />;
  }

  // Return null if no access (redirect is in progress)
  return null;
};

export default ProtectedUsersPage;

