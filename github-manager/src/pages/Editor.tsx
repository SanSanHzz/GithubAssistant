import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GitHubAPI } from '../lib/github'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Code, Highlighter, Save, Loader2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

interface EditorProps {
  token: string
  username: string
}

const COLORS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'
]

export default function Editor({ token, username }: EditorProps) {
  const queryClient = useQueryClient()
  const github = new GitHubAPI(token)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { t } = useLanguage()

  const { data: readme, isLoading } = useQuery({
    queryKey: ['readme', token, username],
    queryFn: async () => {
      const githubNew = new GitHubAPI(token)
      return githubNew.getReadme(username, username)
    },
    enabled: !!username,
    refetchInterval: 10000,
    staleTime: 0
  })

  const commitMutation = useMutation({
    mutationFn: async (content: string) => {
      const sha = await github.getFileSha(username, username, 'README.md')
      await github.updateFile(username, username, 'README.md', content, 'Update profile README', sha || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readme', token, username] })
      queryClient.refetchQueries({ queryKey: ['readme', token, username] })
      setMessage(t('editor.saved'))
      setTimeout(() => setMessage(''), 3000)
    },
    onError: () => {
      setMessage(t('editor.error'))
      setTimeout(() => setMessage(''), 3000)
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true })
    ],
    content: readme || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none'
      }
    }
  })

  useEffect(() => {
    if (editor && readme !== undefined) {
      const currentContent = editor.getHTML()
      if (readme !== currentContent && readme !== '') {
        editor.commands.setContent(readme)
      }
    }
  }, [readme, editor])

  const handleSave = async () => {
    if (!editor) return
    setSaving(true)
    const markdown = editor.getHTML()
    await commitMutation.mutateAsync(markdown)
    setSaving(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  }

  return (
<div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editor.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('editor.subtitle')}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || commitMutation.isPending}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving || commitMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {t('editor.save')}
          </button>
        </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg ${editor?.isActive('bold') ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg ${editor?.isActive('italic') ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Italic className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-lg ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded-lg ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg ${editor?.isActive('bulletList') ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg ${editor?.isActive('orderedList') ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            <button
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={`p-2 rounded-lg ${editor?.isActive('code') ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded-lg ${editor?.isActive('highlight') ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => editor?.chain().focus().setColor(color).run()}
                className={`w-6 h-6 rounded-full border-2 ${editor?.isActive('textColor', { color }) ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          <EditorContent editor={editor} className="prose prose-lg dark:prose-invert max-w-none" />
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        {t('editor.note', { repo: `${username}/${username}` })}
      </p>
    </div>
  )
}