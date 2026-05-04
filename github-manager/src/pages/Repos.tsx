import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GitHubAPI } from '../lib/github'
import type { GitHubRepo } from '../lib/github'
import { Lock, Unlock, Plus, Search, Loader2 } from 'lucide-react'

interface ReposProps {
  token: string
}

const STORAGE_KEY = 'github-manager-changes'

const loadStoredChanges = (): Map<number, boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as [number, boolean][]
      return new Map(parsed)
    }
  } catch {}
  return new Map()
}

const saveChanges = (changes: Map<number, boolean>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(changes.entries())))
  } catch {}
}

export default function Repos({ token }: ReposProps) {
  const queryClient = useQueryClient()
  const github = new GitHubAPI(token)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', private: false })

  const [localChanges, setLocalChanges] = useState<Map<number, boolean>>(() => loadStoredChanges())

  useEffect(() => {
    saveChanges(localChanges)
  }, [localChanges])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newChanges = new Map(JSON.parse(e.newValue) as [number, boolean][])
          setLocalChanges(newChanges)
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const { data: repos, isLoading } = useQuery({
    queryKey: ['repos', token],
    queryFn: async () => {
      const githubNew = new GitHubAPI(token)
      return githubNew.getAllRepos()
    },
    staleTime: 30000
  })

  const getRepoVisibility = (repo: GitHubRepo): boolean => {
    if (localChanges.has(repo.id)) {
      return localChanges.get(repo.id)!
    }
    return repo.private
  }

  const updateVisibility = useMutation({
    mutationFn: async ({ repos, private_ }: { repos: GitHubRepo[], private_: boolean }) => {
      const results = []
      for (const repo of repos) {
        const [owner, name] = repo.full_name.split('/')
        const result = await github.updateRepoVisibility(owner, name, private_)
        results.push(result)
      }
      return results
    },
    onSuccess: (_data, variables) => {
      const newChanges = new Map(localChanges)
      for (const repo of variables.repos) {
        newChanges.set(repo.id, variables.private_)
      }
      setLocalChanges(newChanges)
      setSelected(new Set())
    },
    onError: () => {
      const newChanges = new Map(localChanges)
      const selectedRepos = repos?.filter(r => selected.has(r.id)) || []
      for (const repo of selectedRepos) {
        newChanges.delete(repo.id)
      }
      setLocalChanges(newChanges)
    }
  })

  const toggleSingleRepo = useMutation({
    mutationFn: async ({ repo, private_ }: { repo: GitHubRepo, private_: boolean }) => {
      const [owner, name] = repo.full_name.split('/')
      return github.updateRepoVisibility(owner, name, private_)
    },
    onSuccess: (_data, variables) => {
      const newChanges = new Map(localChanges)
      newChanges.set(variables.repo.id, variables.private_)
      setLocalChanges(newChanges)
    },
    onError: (_err, variables) => {
      const newChanges = new Map(localChanges)
      newChanges.delete(variables.repo.id)
      setLocalChanges(newChanges)
    }
  })

  const createRepo = useMutation({
    mutationFn: async () => {
      return github.createRepo(createForm.name, createForm.description, createForm.private)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repos', token] })
      queryClient.refetchQueries({ queryKey: ['repos', token] })
      setShowCreate(false)
      setCreateForm({ name: '', description: '', private: false })
    }
  })

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const toggleAll = () => {
    if (selected.size === filteredRepos.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredRepos.map(r => r.id)))
    }
  }

  const handleBulkPrivate = () => {
    const selectedRepos = repos?.filter(r => selected.has(r.id)) || []
    updateVisibility.mutate({ repos: selectedRepos, private_: true })
  }

  const handleBulkPublic = () => {
    const selectedRepos = repos?.filter(r => selected.has(r.id)) || []
    updateVisibility.mutate({ repos: selectedRepos, private_: false })
  }

  const filteredRepos = repos?.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description?.toLowerCase().includes(search.toLowerCase()))
  ) || []

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repositorios</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{repos?.length || 0} repositorios en total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Repo
        </button>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selected.size} repositorio(s) seleccionado(s)
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkPrivate}
              disabled={updateVisibility.isPending}
              className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 mr-1" />
              Privado
            </button>
            <button
              onClick={handleBulkPublic}
              disabled={updateVisibility.isPending}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4 mr-1" />
              Público
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar repositorios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === filteredRepos.length && filteredRepos.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Lenguaje</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Visibilidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRepos.map(repo => (
              <tr key={repo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(repo.id)}
                    onChange={() => toggleSelect(repo.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {repo.name}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {repo.description || '-'}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {repo.language || '-'}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSingleRepo.mutate({ repo, private_: !getRepoVisibility(repo) })}
                    disabled={toggleSingleRepo.isPending}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                      getRepoVisibility(repo)
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {getRepoVisibility(repo) ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                    {getRepoVisibility(repo) ? 'Privado' : 'Público'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Crear Repositorio</h2>
            <form onSubmit={(e) => { e.preventDefault(); createRepo.mutate() }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del repositorio
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createForm.private}
                    onChange={(e) => setCreateForm({ ...createForm, private: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Repositorio privado</span>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createRepo.isPending}
                  className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
                >
                  {createRepo.isPending ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}