import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PokemonDetailPage } from './pages/PokemonDetailPage';
import { AddPokemonPage } from './pages/AddPokemonPage';
import { AddPokemonDetailPage } from './pages/AddPokemonDetailPage';
import { PokemonFormPage } from './pages/PokemonFormPage';
import { useAuth } from './hooks/useAuth';

function LandingRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/auth'} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokemon/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddPokemonPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokemon/new/:pokeApiId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddPokemonDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokemon/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PokemonDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pokemon/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PokemonFormPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
