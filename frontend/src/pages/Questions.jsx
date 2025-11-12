import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { createClient, getApiBaseUrl } from '../lib/api.js'

export default function Questions() {
  const { token, user } = useAuth()
  const api = useMemo(() => createClient(token), [token])
  const [company, setCompany] = useState('')
  const [functionName, setFunctionName] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [functionNameSuggestions, setFunctionNameSuggestions] = useState([])
  const [showFunctionNameSuggestions, setShowFunctionNameSuggestions] = useState(false)
  const functionNameInputRef = useRef(null)
  const functionNameSuggestionsRef = useRef(null)

  // Fetch function name suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (user?.role !== 'admin' || functionName.trim().length < 1) {
        setFunctionNameSuggestions([])
        setShowFunctionNameSuggestions(false)
        return
      }
      try {
        const res = await api.get('/api/questions/suggestions/functionNames', { params: { q: functionName } })
        setFunctionNameSuggestions(res.data)
        setShowFunctionNameSuggestions(res.data.length > 0)
      } catch (err) {
        // Ignore errors for suggestions
      }
    }

    const timer = setTimeout(fetchSuggestions, 300) // Debounce 300ms
    return () => clearTimeout(timer)
  }, [functionName, user?.role, api])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (functionNameInputRef.current && functionNameSuggestionsRef.current && 
          !functionNameInputRef.current.contains(e.target) && 
          !functionNameSuggestionsRef.current.contains(e.target)) {
        setShowFunctionNameSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const params = {}
        if (company) params.company = company
        if (functionName && user?.role === 'admin') params.functionName = functionName
        const res = await api.get('/api/questions', { params })
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
  }, [company, functionName, user?.role, api])

  const companies = Array.from(new Set(questions.map(q => q.company)))

  return (
    <div className="py-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-white">Filter by company</label>
          <select className="border border-slate-700 bg-black text-white rounded px-2 py-1" value={company} onChange={e=>setCompany(e.target.value)}>
            <option value="">All</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {user?.role === 'admin' && (
          <div className="flex items-center gap-2 relative" ref={functionNameInputRef}>
            <label className="text-sm text-white">Search by function name</label>
            <div className="relative">
              <input 
                type="text" 
                className="border border-slate-700 bg-black text-white rounded px-2 py-1" 
                placeholder="Enter function name..."
                value={functionName} 
                onChange={e=>setFunctionName(e.target.value)}
                onFocus={() => functionName.trim().length > 0 && functionNameSuggestions.length > 0 && setShowFunctionNameSuggestions(true)}
              />
              {showFunctionNameSuggestions && functionNameSuggestions.length > 0 && (
                <div 
                  ref={functionNameSuggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-black border border-slate-700 rounded shadow-lg max-h-60 overflow-y-auto"
                >
                  {functionNameSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-3 py-2 text-white hover:bg-slate-800 transition"
                      onClick={() => {
                        setFunctionName(suggestion)
                        setShowFunctionNameSuggestions(false)
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <button className="text-sm text-blue-400" onClick={()=>{
          setCompany('')
          setFunctionName('')
        }}>Reset</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {questions.map(q => (
          <QuestionListItem key={q._id} q={q} />
        ))}
      </div>
    </div>
  )
}

function QuestionListItem({ q }) {
  const raw = q.imageUrls?.[0]
  const base = getApiBaseUrl()
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


