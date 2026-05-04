import { useState } from 'react'
import { Terminal, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface LoginProps {
  onLogin: (token: string, username: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleGitHubLogin = () => {
    const clientId = 'Ov23liQSwMeNgVYkSTr8'
    const redirectUri = 'https://dnrif6ny.insforge.site/auth/callback'
    const scope = 'repo,read:user'
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error('Token inválido')
      }

      const user = await response.json()
      onLogin(token, user.login)
    } catch (err) {
      setError('Token inválido. Por favor verifica tu Personal Access Token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl mb-4">
            <Terminal className="w-8 h-8 text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Ingresa tu Personal Access Token para continuar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <button
            onClick={handleGitHubLogin}
            className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg font-bold">🐙</span>
            Iniciar sesión con GitHub
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">o</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Usar Token Manual'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}