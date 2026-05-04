import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Repos from './pages/Repos'
import Editor from './pages/Editor'
import Layout from './components/Layout'
import { ThemeProvider } from './context/ThemeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
})

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('github_token'))
  const [username, setUsername] = useState<string | null>(localStorage.getItem('github_username'))

  const handleLogin = (githubToken: string, githubUsername: string) => {
    localStorage.setItem('github_token', githubToken)
    localStorage.setItem('github_username', githubUsername)
    setToken(githubToken)
    setUsername(githubUsername)
  }

  const handleLogout = () => {
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_username')
    setToken(null)
    setUsername(null)
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route element={<Layout token={token} username={username} onLogout={handleLogout} />}>
              <Route path="/" element={
                token ? <Dashboard token={token} username={username!} /> : <Navigate to="/login" />
              } />
              <Route path="/repos" element={
                token ? <Repos token={token} /> : <Navigate to="/login" />
              } />
              <Route path="/editor" element={
                token ? <Editor token={token} username={username!} /> : <Navigate to="/login" />
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App