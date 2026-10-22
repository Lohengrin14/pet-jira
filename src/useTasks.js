import { useEffect, useState } from 'react'

// Задачи хранятся в localStorage браузера. Позже это место заменит база данных.
const STORAGE_KEY = 'pet-jira:tasks'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // хранилище недоступно (например, приватный режим): работаем без сохранения
    }
  }, [tasks])

  function createTask({ title, projectId, description, assigneeId }) {
    const task = {
      id: crypto.randomUUID(),
      title,
      projectId,
      description,
      assigneeId,
      status: 'todo',
      createdAt: new Date().toISOString(),
    }
    setTasks((all) => [task, ...all])
  }

  function updateTask(id, changes) {
    setTasks((all) => all.map((t) => (t.id === id ? { ...t, ...changes } : t)))
  }

  function deleteTask(id) {
    setTasks((all) => all.filter((t) => t.id !== id))
  }

  return { tasks, createTask, updateTask, deleteTask }
}
