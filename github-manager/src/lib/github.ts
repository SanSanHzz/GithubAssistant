const GITHUB_API = 'https://api.github.com'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
}

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
}

export class GitHubAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${GITHUB_API}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async getUser(): Promise<GitHubUser> {
    return this.fetch<GitHubUser>('/user')
  }

  async getRepos(page = 1, perPage = 100): Promise<GitHubRepo[]> {
    const repos = await this.fetch<GitHubRepo[]>(`/user/repos?page=${page}&per_page=${perPage}&sort=updated`)
    return repos
  }

  async getAllRepos(): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const batch = await this.getRepos(page, 100)
      if (batch.length < 100) {
        hasMore = false
      }
      repos.push(...batch)
      page++
    }

    return repos
  }

  async updateRepoVisibility(owner: string, repo: string, private_: boolean): Promise<GitHubRepo> {
    return this.fetch<GitHubRepo>(`/repos/${owner}/${repo}`, {
      method: 'PATCH',
      body: JSON.stringify({ private: private_ })
    })
  }

  async createRepo(name: string, description = '', isPrivate = false): Promise<GitHubRepo> {
    return this.fetch<GitHubRepo>('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true
      })
    })
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const data = await this.fetch<{ content: string; encoding: string }>(`/repos/${owner}/${repo}/contents/${path}`)
    return atob(data.content)
  }

  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      return await this.getFileContent(owner, repo, 'README.md')
    } catch {
      return ''
    }
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string, sha?: string): Promise<void> {
    const body: Record<string, unknown> = {
      message,
      content: btoa(content)
    }

    if (sha) {
      body.sha = sha
    }

    await this.fetch(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  async getFileSha(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const data = await this.fetch<{ sha: string }>(`/repos/${owner}/${repo}/contents/${path}`)
      return data.sha
    } catch {
      return null
    }
  }
}