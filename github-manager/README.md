# GitHub Manager

**URL de Producción:** https://dnrif6ny.insforge.site

---

## Descripción

GitHub Manager es una aplicación web que permite gestionar repositorios de GitHub de manera más eficiente. Permite visualizar, crear, modificar la privacidad de repositorios y editar el README de perfil de GitHub desde una interfaz intuitiva.

---

## Funcionalidades

### 1. Gestión de Repositorios
- **Listar repositorios** - Visualiza todos tus repositorios con información de visibilidad, lenguaje y descripción
- **Buscar repositorios** - Filtra repositorios por nombre o descripción
- **Crear repositorios** - Crea nuevos repositorios (públicos o privados)
- **Cambiar privacidad** - Modifica la visibilidad de repositorios individualmente o en lote (seleección múltiple)

### 2. Editor de Perfil (README)
- **Editor tipo Word** - Interfaz de edición enriquecida con opciones de formato:
  - Negrita, cursiva, títulos (H1, H2, H3)
  - Listas (ordenadas y desordenadas)
  - Código inline
  - Resaltado de texto
  - Colores de texto
- **Preview en tiempo real** - Ve los cambios mientras editas
- **Guardado automático** - Commit directo a tu repositorio de perfil

### 3. Sistema de Tema
- **Dark/Light Mode** - Toggling entre modo oscuro y claro
- **Persistencia** - El tema seleccionado se guarda y sincroniza entre pestañas

### 4. Comunicación en Tiempo Real
- **Sincronización entre pestañas** - Los cambios de estado se reflejan instantáneamente en otras pestañas abiertas
- **Persistencia de estado** - Los cambios localres survive refresh del navegador

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Login   │  │Dashboard │  │  Repos   │  │  Editor │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│         │            │            │           │        │
│         └────────────┴────────────┴───────────┘        │
│                          │                              │
│                   ┌──────┴──────┐                       │
│                   │ React Query │ (Estado + Cache)     │
│                   └──────┬──────┘                       │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                    GitHub API (REST)
```

### Componentes Principales

| Componente | Responsabilidad |
|------------|-----------------|
| `App.tsx` | Routing y providers globales |
| `ThemeContext` | Gestión del tema (dark/light) |
| `Repos.tsx` | Gestión de repositorios con estado local |
| `Editor.tsx` | Editor de README con TipTap |
| `github.ts` | Wrapper para API de GitHub |
| `insforge.ts` | Cliente de InsForge SDK |

### Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estado**: TanStack React Query + Context API
- **Estilos**: Tailwind CSS
- **Editor**: TipTap (Rich Text Editor)
- **Despliegue**: InsForge (Vercel-compatible)
- **API**: GitHub REST API v3

---

## Lógica de Negocio

### Estado de Visibilidad de Repositorios

El desafío principal era mantener el estado correcto de visibilidad considerando el delay de GitHub API. La solución implementada:

1. **Estado local `localChanges`**: Map que almacena los cambios realizados por el usuario
2. **Función `getRepoVisibility()`**: Retorna el valor de `localChanges` si existe, sino usa el valor del servidor
3. **Persistencia en localStorage**: Los cambios survive al refresh del navegador
4. **Storage Events**: Sincronización entre pestañas

```typescript
const getRepoVisibility = (repo: GitHubRepo): boolean => {
  if (localChanges.has(repo.id)) {
    return localChanges.get(repo.id)!
  }
  return repo.private
}
```

### Autenticación

- Usa **Personal Access Token** de GitHub
- El token se guarda en localStorage
- Se envía en cada request a la API de GitHub

### Mutations y Optimistic Updates

Los cambios se confirman con GitHub y luego se actualiza el estado local, evitandoconfictos con datos stale del servidor.

---

## Variables de Entorno

```env
VITE_GITHUB_CLIENT_ID=Ov23liCZGkZ1nO5pN9qX
VITE_INSFORGE_URL=https://dnrif6ny.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=eyJ...
```

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

---

## Producción

La aplicación está desplegada en InsForge: https://dnrif6ny.insforge.site

---

## Permisos Requeridos del Token

Para usar la aplicación, el Personal Access Token debe tener:
- `repo` - Acceso a repositorios
- `read:user` - Leer información del usuario

---

## Licencia

MIT