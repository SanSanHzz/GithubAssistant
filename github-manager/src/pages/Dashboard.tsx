import { useQuery } from '@tanstack/react-query'
import { GitHubAPI } from '../lib/github'
import { FolderGit2, Star, FileEdit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

interface DashboardProps {
  token: string
  username: string
}

export default function Dashboard({ token, username }: DashboardProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', token],
    queryFn: async () => {
      const githubNew = new GitHubAPI(token)
      return githubNew.getUser()
    },
    refetchInterval: 10000,
    staleTime: 0
  })

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['repos', token],
    queryFn: async () => {
      const githubNew = new GitHubAPI(token)
      return githubNew.getAllRepos()
    },
    refetchInterval: 5000,
    staleTime: 0,
    refetchOnWindowFocus: true
  })

  if (userLoading || reposLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  const publicRepos = repos?.filter(r => !r.private).length || 0
  const privateRepos = repos?.filter(r => r.private).length || 0
  const totalStars = repos?.reduce((acc, r) => acc + r.stargazers_count, 0) || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.welcome', { name: user?.name || username })}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.publicRepos')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{publicRepos}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FolderGit2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.privateRepos')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{privateRepos}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FolderGit2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.totalStars')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalStars}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/repos')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.manageRepos')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.manageReposDesc')}</p>
            </div>
            <FolderGit2 className="w-8 h-8 text-gray-400" />
          </div>
        </button>

        <button
          onClick={() => navigate('/editor')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.editProfile')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.editProfileDesc')}</p>
            </div>
            <FileEdit className="w-8 h-8 text-gray-400" />
          </div>
        </button>
      </div>

      {user?.avatar_url && (
        <div className="mt-8 flex items-center">
          <img src={user.avatar_url} alt={username} className="w-12 h-12 rounded-full" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
          </div>
        </div>
      )}
    </div>
  )
}