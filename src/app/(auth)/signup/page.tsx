'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? '登録に失敗しました')
      setLoading(false)
      return
    }

    const userId = data.user.id

    // users テーブルに保存
    const { error: userError } = await supabase
      .from('users')
      .insert({ id: userId, email })

    if (userError) {
      setError(userError.message)
      setLoading(false)
      return
    }

    // profiles テーブルに保存
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, username, display_name: username })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">StyleStock Quest</h1>
          <p className="mt-1 text-sm text-zinc-400">新規登録</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">ユーザー名</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              placeholder="username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300">パスワード</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-amber-400 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
