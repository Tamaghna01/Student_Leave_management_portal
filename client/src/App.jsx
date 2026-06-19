import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';

// Pages
import LoginPage         from './pages/LoginPage';
import StudentDashboard  from './pages/StudentDashboard';
import ApplyLeavePage    from './pages/ApplyLeavePage';
import LeaveHistoryPage  from './pages/LeaveHistoryPage';
import FacultyDashboard  from './pages/FacultyDashboard';
import PendingLeavesPage from './pages/PendingLeavesPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student-only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply-leave"
            element={
              <ProtectedRoute role="student">
                <ApplyLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute role="student">
                <LeaveHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Faculty-only routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute role="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/pending"
            element={
              <ProtectedRoute role="faculty">
                <PendingLeavesPage />
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
