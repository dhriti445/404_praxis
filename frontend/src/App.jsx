import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import ChatbotPage from './pages/ChatbotPage'
import ComplianceCheckerPage from './pages/ComplianceCheckerPage'
import PolicyAnalyzerPage from './pages/PolicyAnalyzerPage'
import ReportsPage from './pages/ReportsPage'
import PlaybooksPage from './pages/PlaybooksPage'
import ComplianceCheckerV2Page from './pages/ComplianceCheckerV2Page'
import WebsiteCheckerPage from './pages/WebsiteCheckerPage'
import ComplianceHistoryPage from './pages/ComplianceHistoryPage'
import PolicyGeneratorPage from './pages/PolicyGeneratorPage'
import LandingPage from './pages/LandingPage'

function withShell(element) {
  return <AppShell>{element}</AppShell>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/workspace" element={withShell(<DashboardPage />)} />
      <Route path="/chat" element={withShell(<ChatbotPage />)} />
      <Route path="/compliance" element={withShell(<ComplianceCheckerPage />)} />
      <Route path="/compliance-analyzer" element={withShell(<ComplianceCheckerV2Page />)} />
      <Route path="/website-checker" element={withShell(<WebsiteCheckerPage />)} />
      <Route path="/compliance-history" element={withShell(<ComplianceHistoryPage />)} />
      <Route path="/policy-generator" element={withShell(<PolicyGeneratorPage />)} />
      <Route path="/policy" element={withShell(<PolicyAnalyzerPage />)} />
      <Route path="/playbooks" element={withShell(<PlaybooksPage />)} />
      <Route path="/reports" element={withShell(<ReportsPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
