import i18next from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import type { HttpBackendOptions } from 'i18next-http-backend'
import { useEffect } from 'react'

// initialize i18next once; guard to avoid re-init in HMR
if (!i18next.isInitialized) {
  i18next
    .use(HttpBackend)
    .use(initReactI18next)
    .init<HttpBackendOptions>({
      lng: 'en',
      fallbackLng: 'en',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      backend: {
        // direct call to Go backend; no Vite proxy needed
        loadPath: 'http://localhost:8080/locales/{{lng}}/{{ns}}.json',
      },
    })
    .catch((e: unknown) => console.error('i18next init failed', e))
}

export function App() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Optional: verify backend is reachable in dev
    fetch('http://localhost:8080/healthz').catch(() => { })
  }, [])

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
      <h2>{t('helloUser', { name: 'Ada' })}</h2>
      <h3>{t('stuff', { house: 'My House' })}</h3>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
        <button onClick={() => i18n.changeLanguage('de')} style={{ marginLeft: 8 }}>
          Deutsch
        </button>
      </div>
    </>
  )
}
