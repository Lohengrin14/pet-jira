import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, getToken, setToken } from './api.js'

// Состояние доски: кто вошёл, пользователи, проекты, задачи. Всё приходит с сервера.
export function useBoard() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  // 'loading' пока сервер отвечает в первый раз (бесплатный Render просыпается до минуты)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setTasks([])
  }, [])

  // Общая обёртка: показывает ошибку сервера, при протухшем токене выходит
  const run = useCallback(
    async (action) => {
      try {
        setError(null)
        return await action()
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) logout()
        setError(e.message)
        throw e
      }
    },
    [logout],
  )

  // Проекты и задачи грузим сразу после входа
  const loadBoard = useCallback(async () => {
    const [projectList, taskList] = await Promise.all([api.projects(), api.tasks()])
    setProjects(projectList)
    setTasks(taskList)
  }, [])

  // Первый запуск: список пользователей для входа и, если есть токен, текущий пользователь
  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const list = await api.users()
        const me = getToken() ? await api.me().catch(() => null) : null
        if (cancelled) return
        if (!me) setToken(null)
        else await loadBoard()
        if (cancelled) return
        setUsers(list)
        setUser(me)
        setStatus('ready')
      } catch (e) {
        if (!cancelled) {
          setError(e.message)
          setStatus('failed')
        }
      }
    }
    start()
    return () => {
      cancelled = true
    }
  }, [loadBoard])

  async function login(userId) {
    const { token, user: me } = await run(() => api.login(userId))
    setToken(token)
    await run(loadBoard)
    setUser(me)
  }

  async function createTask(data) {
    const task = await run(() => api.createTask(data))
    setTasks((all) => [task, ...all])
  }

  async function updateTask(id, changes) {
    const before = tasks
    // Сразу показываем изменение, чтобы перетаскивание не подтормаживало
    if ('status' in changes) setTasks((all) => all.map((t) => (t.id === id ? { ...t, status: changes.status } : t)))
    try {
      const task = await run(() => api.updateTask(id, changes))
      setTasks((all) => all.map((t) => (t.id === id ? task : t)))
    } catch (e) {
      setTasks(before)
      throw e
    }
  }

  async function deleteTask(id) {
    await run(() => api.deleteTask(id))
    setTasks((all) => all.filter((t) => t.id !== id))
  }

  // Админка: пользователи и проекты. После правки имени или проекта перечитываем задачи,
  // потому что в них лежат имена авторов, исполнителей и названия проектов
  async function createUser(data) {
    const created = await run(() => api.createUser(data))
    setUsers((all) => [...all, created])
  }

  async function updateUser(id, changes) {
    const updated = await run(() => api.updateUser(id, changes))
    setUsers((all) => all.map((u) => (u.id === id ? updated : u)))
    if (id === user.id) setUser(updated)
    await run(loadBoard)
  }

  async function deleteUser(id) {
    await run(() => api.deleteUser(id))
    setUsers((all) => all.filter((u) => u.id !== id))
    await run(loadBoard)
  }

  async function createProject(data) {
    const created = await run(() => api.createProject(data))
    setProjects((all) => [...all, created])
  }

  async function updateProject(id, changes) {
    const updated = await run(() => api.updateProject(id, changes))
    setProjects((all) => all.map((p) => (p.id === id ? updated : p)))
    await run(loadBoard)
  }

  async function deleteProject(id) {
    await run(() => api.deleteProject(id))
    setProjects((all) => all.filter((p) => p.id !== id))
  }

  // Комментарии грузит окно задачи, а счётчик на карточке обновляем здесь
  function changeCommentCount(taskId, delta) {
    setTasks((all) => all.map((t) => (t.id === taskId ? { ...t, commentCount: t.commentCount + delta } : t)))
  }

  return {
    user,
    users,
    projects,
    tasks,
    status,
    error,
    clearError: () => setError(null),
    run,
    login,
    logout,
    createTask,
    updateTask,
    deleteTask,
    changeCommentCount,
    createUser,
    updateUser,
    deleteUser,
    createProject,
    updateProject,
    deleteProject,
  }
}
