import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import ChatbotPage from './pages/ChatbotPage'
import ComplianceCheckerPage from './pages/ComplianceCheckerPage'
import PolicyAnalyzerPage from './pages/PolicyAnalyzerPage'
import ReportsPage from './pages/ReportsPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/compliance" element={<ComplianceCheckerPage />} />
        <Route path="/policy" element={<PolicyAnalyzerPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
