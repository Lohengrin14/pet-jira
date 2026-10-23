import { useEffect, useRef, useState } from 'react'
import { ROLES } from '../data.js'

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'

// Скрипт Google Identity Services грузим один раз и только на экране входа
let googleScript
function loadGoogle() {
  googleScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT
    script.async = true
    script.onload = () => resolve(window.google)
    script.onerror = () => {
      googleScript = undefined
      reject(new Error('Не удалось загрузить вход через Google'))
    }
    document.head.appendChild(script)
  })
  return googleScript
}

// Экран входа: через Google и, пока включено на сервере, под тестовым пользователем без пароля
export function LoginScreen({ options, devUsers, onLogin, onGoogle, error }) {
  const [pending, setPending] = useState(null)

  async function choose(id) {
    setPending(id)
    try {
      await onLogin(id)
    } catch {
      setPending(null)
    }
  }

  return (
    <div className="screen-center">
      <h1 className="title">Pet Jira</h1>
      <p className="muted">Моковая доска для проверки работы агентов</p>

      {options.googleClientId && <GoogleButton clientId={options.googleClientId} onCredential={onGoogle} />}

      {options.devLogin && devUsers.length > 0 && (
        <div className="user-list">
          <p className="muted small login-divider">
            {options.googleClientId ? 'или войти как тестовый пользователь' : 'Войти как тестовый пользователь'}
          </p>
          {devUsers.map((u) => (
            <button key={u.id} className="user-option" disabled={pending !== null} onClick={() => choose(u.id)}>
              <span className="avatar avatar-lg">{u.name[0]}</span>
              <span className="user-option-text">
                <strong>{u.name}</strong>
                <span className="muted">
                  {ROLES[u.role].title}: {ROLES[u.role].hint}
                </span>
              </span>
              {pending === u.id && <span className="spinner spinner-sm" />}
            </button>
          ))}
        </div>
      )}

      {!options.googleClientId && !options.devLogin && (
        <p className="error-text">На сервере не настроен ни один способ входа.</p>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

// Официальная кнопка «Sign in with Google». Google сам рисует её и отдаёт ID-токен,
// а мы меняем его на свой токен через POST /auth/google
function GoogleButton({ clientId, onCredential }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(null)
  // Свежий обработчик без перерисовки кнопки Google на каждый рендер
  const callbackRef = useRef(onCredential)
  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    let cancelled = false
    loadGoogle()
      .then((google) => {
        if (cancelled || !ref.current) return
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => callbackRef.current(response.credential).catch(() => {}),
        })
        google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          locale: 'ru',
          width: 300,
        })
      })
      .catch((e) => !cancelled && setFailed(e.message))
    return () => {
      cancelled = true
    }
  }, [clientId])

  return (
    <div className="google-login">
      <div ref={ref} className="google-button" />
      {failed && <p className="error-text">{failed}</p>}
    </div>
  )
}
