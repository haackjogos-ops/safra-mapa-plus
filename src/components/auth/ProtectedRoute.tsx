import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePageAccess } from '@/hooks/usePageAccess';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: canAccess, isLoading: checkingAccess } = usePageAccess(location.pathname);

  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (canAccess === false) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
