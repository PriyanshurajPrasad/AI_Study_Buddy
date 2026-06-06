import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import AIAssistant from './pages/AIAssistant';
import AIHistory from './pages/AIHistory';
import Quiz from './pages/Quiz';
import QuizCreate from './pages/QuizCreate';
import QuizAttempt from './pages/QuizAttempt';
import QuizResultDetail from './pages/QuizResultDetail';
import Progress from './pages/Progress';
import TestHistory from './pages/TestHistory';
import SubjectStatistics from './pages/SubjectStatistics';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import Settings from './pages/Settings';

// Styles
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <NoteDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-history"
            element={
              <ProtectedRoute>
                <AIHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/create"
            element={
              <ProtectedRoute>
                <QuizCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/attempt/:id"
            element={
              <ProtectedRoute>
                <QuizAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/attempt"
            element={
              <ProtectedRoute>
                <QuizAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress/test-history"
            element={
              <ProtectedRoute>
                <TestHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress/subject-statistics"
            element={
              <ProtectedRoute>
                <SubjectStatistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-result/:resultId"
            element={
              <ProtectedRoute>
                <QuizResultDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz-result/local"
            element={
              <ProtectedRoute>
                <QuizResultDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
