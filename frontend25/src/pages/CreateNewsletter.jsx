import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function CreateNewsletter() {
  const [theme, setTheme] = useState('light')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  const rootTheme = theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
  const cardTheme = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({ title, summary, content, date })
      })

      const data = await res.json()
      if (res.ok) {
        alert('Newsletter created')
        navigate('/codashboard')
      } else {
        alert(data.message || 'Failed to create newsletter')
      }
    } catch (err) {
      console.error('Create newsletter error:', err)
      alert('Failed to create newsletter')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${rootTheme} min-h-screen`}>
      <header className="border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Placify" className="w-8 h-8 object-contain" />
            <div className="font-semibold text-lg text-[#2b128f] md:text-xl">Placify</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full border px-3 py-1.5 text-xs md:text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {theme === 'light' ? 'Dark Theme' : 'Light Theme'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <div className={`p-6 rounded-xl border ${cardTheme}`}>
          <h2 className="text-2xl font-semibold mb-4">Create Newsletter</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Summary</label>
              <input required value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-3 py-2 rounded border" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea required value={content} onChange={e => setContent(e.target.value)} rows={8} className="w-full px-3 py-2 rounded border" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded border" />
            </div>

            <div className="flex gap-2">
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded bg-[#443097] text-white">{submitting ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={() => navigate('/codashboard')} className="px-4 py-2 rounded border">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
