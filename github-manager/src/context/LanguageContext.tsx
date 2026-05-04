import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

type Language = 'es' | 'en'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    'login.title': 'GitHub Manager',
    'login.subtitle': 'Ingresa tu Personal Access Token para continuar',
    'login.oauth': 'Iniciar sesión con GitHub',
    'login.or': 'o',
    'login.tokenLabel': 'Personal Access Token',
    'login.tokenPlaceholder': 'ghp_xxxxxxxxxxxxxxxxxxxx',
    'login.submit': 'Usar Token Manual',
    'login.loading': 'Verificando...',
    'login.error': 'Token inválido. Por favor verifica tu Personal Access Token.',
    'help.title': 'Cómo obtener tu Token',
    'help.steps': 'Sigue estos pasos para crear un Personal Access Token:',
    'help.step1': 'Ve a',
    'help.step2': 'Haz clic en "Generate new token" → "Generate new token (classic)"',
    'help.step3': 'En "Note", escribe un nombre descriptivo (ej: "GitHub Manager")',
    'help.step4': 'En "Expiration", selecciona la duración que prefieras',
    'help.step5': 'Selecciona los permisos',
    'help.step6': 'Haz clic en "Generate token"',
    'help.step7': 'Copia el token y pégalo arriba (solo se muestra una vez)',
    'help.warning': 'Guarda tu token en un lugar seguro. No podrás verlo después de salir de esta página.',
    'dashboard.welcome': '¡Bienvenido, {name}!',
    'dashboard.subtitle': 'Gestiona tus repositorios fácilmente',
    'dashboard.publicRepos': 'Repositorios Públicos',
    'dashboard.privateRepos': 'Repositorios Privados',
    'dashboard.totalStars': 'Total Estrellas',
    'dashboard.manageRepos': 'Gestionar Repositorios',
    'dashboard.manageReposDesc': 'Ver, crear y modificar privacidad de repos',
    'dashboard.editProfile': 'Editar Perfil',
    'dashboard.editProfileDesc': 'Edita tu README de perfil de GitHub',
    'repos.title': 'Repositorios',
    'repos.total': '{count} repositorios en total',
    'repos.newRepo': 'Nuevo Repo',
    'repos.selected': '{count} repositorio(s) seleccionado(s)',
    'repos.private': 'Privado',
    'repos.public': 'Público',
    'repos.search': 'Buscar repositorios...',
    'repos.name': 'Nombre',
    'repos.description': 'Descripción',
    'repos.language': 'Lenguaje',
    'repos.visibility': 'Visibilidad',
    'repos.createTitle': 'Crear Repositorio',
    'repos.repoName': 'Nombre del repositorio',
    'repos.repoDesc': 'Descripción',
    'repos.privateRepo': 'Repositorio privado',
    'repos.cancel': 'Cancelar',
    'repos.creating': 'Creando...',
    'repos.create': 'Crear',
    'editor.title': 'Editor de Perfil',
    'editor.subtitle': 'Edita tu README de perfil de GitHub',
    'editor.save': 'Guardar Cambios',
    'editor.saved': '¡Guardado exitosamente!',
    'editor.error': 'Error al guardar',
    'editor.note': 'Nota: Tu README de perfil debe estar en el repositorio {repo}',
    'layout.dashboard': 'Dashboard',
    'layout.repos': 'Repositorios',
    'layout.editor': 'Editor README',
    'callback.title': 'Iniciando sesión...',
    'callback.starting': 'Iniciando...',
    'callback.noCode': 'Sin código',
    'callback.exchanging': 'Intercambiando código...',
    'callback.expired': 'Código expirado. Intentá de nuevo.',
    'callback.tokenObtained': '¡Token obtenido!',
    'callback.ready': '¡Listo! Redirigiendo...',
    'callback.error': 'Error: ',
  },
  en: {
    'login.title': 'GitHub Manager',
    'login.subtitle': 'Enter your Personal Access Token to continue',
    'login.oauth': 'Sign in with GitHub',
    'login.or': 'or',
    'login.tokenLabel': 'Personal Access Token',
    'login.tokenPlaceholder': 'ghp_xxxxxxxxxxxxxxxxxxxx',
    'login.submit': 'Use Manual Token',
    'login.loading': 'Verifying...',
    'login.error': 'Invalid token. Please verify your Personal Access Token.',
    'help.title': 'How to get your Token',
    'help.steps': 'Follow these steps to create a Personal Access Token:',
    'help.step1': 'Go to',
    'help.step2': 'Click "Generate new token" → "Generate new token (classic)"',
    'help.step3': 'In "Note", write a descriptive name (e.g., "GitHub Manager")',
    'help.step4': 'In "Expiration", select your preferred duration',
    'help.step5': 'Select the permissions',
    'help.step6': 'Click "Generate token"',
    'help.step7': 'Copy the token and paste it above (it will only be shown once)',
    'help.warning': 'Keep your token safe. You won\'t be able to see it after leaving this page.',
    'dashboard.welcome': 'Welcome, {name}!',
    'dashboard.subtitle': 'Manage your repositories easily',
    'dashboard.publicRepos': 'Public Repositories',
    'dashboard.privateRepos': 'Private Repositories',
    'dashboard.totalStars': 'Total Stars',
    'dashboard.manageRepos': 'Manage Repositories',
    'dashboard.manageReposDesc': 'View, create and modify repository privacy',
    'dashboard.editProfile': 'Edit Profile',
    'dashboard.editProfileDesc': 'Edit your GitHub profile README',
    'repos.title': 'Repositories',
    'repos.total': '{count} repositories in total',
    'repos.newRepo': 'New Repo',
    'repos.selected': '{count} repository(ies) selected',
    'repos.private': 'Private',
    'repos.public': 'Public',
    'repos.search': 'Search repositories...',
    'repos.name': 'Name',
    'repos.description': 'Description',
    'repos.language': 'Language',
    'repos.visibility': 'Visibility',
    'repos.createTitle': 'Create Repository',
    'repos.repoName': 'Repository name',
    'repos.repoDesc': 'Description',
    'repos.privateRepo': 'Private repository',
    'repos.cancel': 'Cancel',
    'repos.creating': 'Creating...',
    'repos.create': 'Create',
    'editor.title': 'Profile Editor',
    'editor.subtitle': 'Edit your GitHub profile README',
    'editor.save': 'Save Changes',
    'editor.saved': 'Saved successfully!',
    'editor.error': 'Error saving',
    'editor.note': 'Note: Your profile README must be in the repository {repo}',
    'layout.dashboard': 'Dashboard',
    'layout.repos': 'Repositories',
    'layout.editor': 'README Editor',
    'callback.title': 'Signing in...',
    'callback.starting': 'Starting...',
    'callback.noCode': 'No code',
    'callback.exchanging': 'Exchanging code...',
    'callback.expired': 'Code expired. Try again.',
    'callback.tokenObtained': 'Token obtained!',
    'callback.ready': 'Ready! Redirecting...',
    'callback.error': 'Error: ',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_KEY = 'github-manager-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY)
    if (stored === 'es' || stored === 'en') return stored
    return 'es'
  })

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  const toggleLanguage = () => setLanguage(l => l === 'es' ? 'en' : 'es')
  
  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}