'use client'

import { useState, useEffect } from 'react'

const SESSION_KEY = 'stickerFair2026_unlocked'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const password = process.env.NEXT_PUBLIC_PASSWORD

  // null = not yet mounted; avoids flash of lock screen for already-unlocked sessions
  const [unlocked, setUnlocked] = useState<boolean | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (!password) {
      setUnlocked(true)
      return
    }
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === '1')
  }, [password])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === password) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  if (unlocked === null) return null
  if (unlocked) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <div className="mb-4 flex justify-center">
          <svg
            className="h-10 w-10 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="mb-1 text-center text-lg font-bold tracking-tight text-gray-900">
          Super Sticker Man 2026
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">貼紙展</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError(false)
              }}
              placeholder="請輸入密碼"
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPw ? '隱藏密碼' : '顯示密碼'}
            >
              {showPw ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">密碼錯誤，請再試一次</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800"
          >
            進入
          </button>
        </form>
      </div>
    </div>
  )
}
