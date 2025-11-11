import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { createClient } from '../lib/api.js'

export default function Questions() {
  const { token } = useAuth()
  const api = useMemo(() => createClient(token), [token])
  const [company, setCompany] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/api/questions', { params: company ? { company } : {} })
        setQuestions(res.data)
        console.log('Loaded questions:', res.data.length)
      } catch (err) {
        console.error('Failed to load questions:', err)
        setError('Failed to load questions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [company, api])

  const companies = Array.from(new Set(questions.map(q => q.company)))

  return (
    <div className="py-6">
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-white">Filter by company</label>
        <select className="border border-slate-700 bg-black text-white rounded px-2 py-1" value={company} onChange={e=>setCompany(e.target.value)}>
          <option value="">All</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="text-sm text-blue-400" onClick={()=>setCompany('')}>Reset</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {questions
          .filter(q => !company || q.company === company)
          .map(q => (
          <QuestionListItem key={q._id} q={q} />
        ))}
      </div>
    </div>
  )
}

function QuestionListItem({ q }) {
  const raw = q.imageUrls?.[0]
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const thumb = raw && (raw.startsWith('http') ? raw : `${base}${raw}`)
  return (
    <Link to={`/questions/${q._id}`} className="block bg-black shadow rounded p-4 hover:shadow-md transition border border-slate-700">
      <div className="flex items-start gap-3">
        {thumb && <img src={thumb} alt="thumb" className="w-24 h-24 object-cover rounded" />}
        <div>
          <div className="font-semibold text-white">{q.company ? q.company.charAt(0).toUpperCase() + q.company.slice(1) : q.company}</div>
          <div className="line-clamp-2 text-sm text-gray-300">{q.questionText}</div>
        </div>
      </div>
    </Link>
  )
}


