import { useEffect, useState } from 'react'
import { Terminal } from 'lucide-react'
import { GitHubAPI } from '../lib/github'
import { useLanguage } from '../context/LanguageContext'

export default function Callback() {
  const { t } = useLanguage()
  const [status, setStatus] = useState(t('callback.starting'))

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (!code) {
      setStatus(t('callback.noCode'))
      setTimeout(() => window.location.href = '/login', 2000)
      return
    }

    setStatus(t('callback.exchanging'))

    try {
      const response = await fetch('https://dnrif6ny.us-east.insforge.app/functions/github-oauth?code=' + code, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const tokenData = await response.json()

      if (!tokenData.access_token) {
        console.error('Token error:', tokenData)
        setStatus(t('callback.expired'))
        setTimeout(() => window.location.href = '/login', 3000)
        return
      }

      setStatus(t('callback.tokenObtained'))

      const github = new GitHubAPI(tokenData.access_token)
      const user = await github.getUser()
      
      localStorage.setItem('github_token', tokenData.access_token)
      localStorage.setItem('github_username', user.login)
      
      setStatus(t('callback.ready'))
      setTimeout(() => window.location.href = '/', 1500)
    } catch (err) {
      console.error('Error:', err)
      setStatus(t('callback.error') + (err instanceof Error ? err.message : 'Error'))
      setTimeout(() => window.location.href = '/login', 3000)
    }
  }

  useEffect(() => {
    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify w-16 h-16 bg-gray-900 dark:bg-white rounded-2xl mb-4">
          <Terminal className="w-8 h-8 text-white dark:text-gray-900 animate-pulse" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('callback.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{status}</p>
      </div>
    </div>
  )
}