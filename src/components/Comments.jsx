import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { can } from '../permissions.js'

const timeFormat = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Обсуждение задачи. Ошибки показывает общий баннер доски через run
export function Comments({ task, user, run, onChange }) {
  const [comments, setComments] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    run(() => api.comments(task.id))
      .then(setComments)
      .catch(() => setComments([]))
  }, [task.id, run])

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const comment = await run(() => api.addComment(task.id, text.trim()))
      setComments((all) => [...all, comment])
      setText('')
      onChange(1)
    } catch {
      // текст остаётся в поле, ошибка уже на баннере
    }
    setSending(false)
  }

  async function remove(id) {
    try {
      await run(() => api.deleteComment(id))
      setComments((all) => all.filter((c) => c.id !== id))
      onChange(-1)
    } catch {
      // ошибка уже на баннере
    }
  }

  return (
    <section className="comments">
      <h3 className="comments-title">Комментарии</h3>
      {comments === null && <p className="muted small">Загружаем…</p>}
      {comments?.length === 0 && <p className="muted small">Пока никто ничего не написал.</p>}
      {comments?.map((c) => (
        <div key={c.id} className="comment">
          <span className="avatar">{c.author.name[0]}</span>
          <div className="comment-body">
            <div className="comment-meta">
              <strong>{c.author.name}</strong>
              <span className="muted">{timeFormat.format(new Date(c.createdAt))}</span>
              {can.deleteComment(user, c) && (
                <button className="link-btn comment-delete" onClick={() => remove(c.id)}>
                  Удалить
                </button>
              )}
            </div>
            <p className="comment-text">{c.text}</p>
          </div>
        </div>
      ))}

      {can.comment(user) && (
        <form className="comment-form" onSubmit={send}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать комментарий"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e)
            }}
          />
          <button type="submit" className="btn" disabled={sending || !text.trim()}>
            Отправить
          </button>
        </form>
      )}
    </section>
  )
}
