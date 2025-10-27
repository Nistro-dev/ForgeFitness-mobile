import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CategoryList } from './pages/CategoryList';
import { CategoryCreate } from './pages/CategoryCreate';
import { CategoryEdit } from './pages/CategoryEdit';
import { Layout } from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mobile/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoryList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mobile/categories/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoryCreate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mobile/categories/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoryEdit />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}

export default App;
