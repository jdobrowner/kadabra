import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/custom/Header'
import { Sidebar } from './components/custom/Sidebar'
import { Loading } from './components/custom/Loading'
import ProtectedRoute from './components/ProtectedRoute'
import { StoreSubscriptions } from './components/StoreSubscriptions'
import HomePage from './pages/HomePage'
import ComponentsPage from './pages/ComponentsPage'
import CustomComponentsPage from './pages/CustomComponentsPage'
import Dashboard from './pages/Dashboard'
import TriageLeaderboard from './pages/TriageLeaderboard'
import CustomerOverview from './pages/CustomerOverview'
import ActionPlan from './pages/ActionPlan'
import ConversationHistory from './pages/ConversationHistory'
import ConversationTranscript from './pages/ConversationTranscript'
import HistoricSearch from './pages/HistoricSearch'
import BoardsPage from './pages/Boards'
import RemindersView from './pages/RemindersView'
import ImportData from './pages/ImportData'
import SignIn from './pages/SignIn'
import OAuthCallback from './pages/OAuthCallback'
import Settings from './pages/Settings'
import { useAuthStore } from './store/useAuthStore'
import './App.css'
import { AIAgentSidebar } from './components/custom/AIAgentPanel/index'

function AppContent() {
  const { checkAuth, user, isAuthenticated, isLoading, hasCheckedAuth } = useAuthStore()

  useEffect(() => {
    // Only check auth if we haven't checked yet (prevents multiple checks)
    if (!hasCheckedAuth) {
    checkAuth()
    }
  }, [checkAuth, hasCheckedAuth])

  // Show loading screen until initial auth check is complete
  // This prevents the sign-in screen from flashing for authenticated users
  if (!hasCheckedAuth || isLoading) {
    return <Loading />
  }

  return (
    <>
      {/* Background subscription component - updates stores on database changes */}
      {isAuthenticated && <StoreSubscriptions />}
      
        {isAuthenticated && (
        <>
          <Header 
            userAvatar={user?.avatar || "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"} 
            userName={user?.name || "User"} 
          />
          <Sidebar />
        </>
        )}
      
      <div className={isAuthenticated ? 'app-layout' : ''}>
        <div className="app-main">
          <div className="app-content">
        <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/triage" element={
          <ProtectedRoute>
            <TriageLeaderboard />
          </ProtectedRoute>
        } />
        <Route path="/triage/customers/:customerId" element={
          <ProtectedRoute>
            <CustomerOverview />
          </ProtectedRoute>
        } />
        <Route path="/triage/customers/:customerId/conversations" element={
          <ProtectedRoute>
            <ConversationHistory />
          </ProtectedRoute>
        } />
        <Route path="/triage/customers/:customerId/action-plans/:actionPlanId" element={
          <ProtectedRoute>
            <ActionPlan />
          </ProtectedRoute>
        } />
        <Route path="/triage/customers/:customerId/conversations/:conversationId" element={
          <ProtectedRoute>
            <ConversationTranscript />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoricSearch />
          </ProtectedRoute>
        } />
        <Route path="/boards" element={
          <ProtectedRoute>
            <BoardsPage />
          </ProtectedRoute>
        } />
        <Route path="/boards/:boardId" element={
          <ProtectedRoute>
            <BoardsPage />
          </ProtectedRoute>
        } />
        <Route path="/kanban" element={<Navigate to="/boards" replace />} />
        <Route path="/reminders" element={
          <ProtectedRoute>
            <RemindersView />
          </ProtectedRoute>
        } />
        <Route path="/import-data" element={
          <ProtectedRoute>
            <ImportData />
          </ProtectedRoute>
        } />
        <Route path="/components" element={
          <ProtectedRoute>
            <ComponentsPage />
          </ProtectedRoute>
        } />
        <Route path="/custom-components" element={
          <ProtectedRoute>
            <CustomComponentsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        </Routes>
          </div>
          {isAuthenticated && <AIAgentSidebar />}
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

