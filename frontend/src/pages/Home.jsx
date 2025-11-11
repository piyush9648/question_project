import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createClient, getApiBaseUrl } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function Home() {
  const api = useMemo(() => createClient(), [])
  const { user } = useAuth()
  const [company, setCompany] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [latest, setLatest] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (company.trim().length < 1) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }
      try {
        const res = await api.get('/api/questions/suggestions/companies', { params: { q: company } })
        setSuggestions(res.data)
        setShowSuggestions(res.data.length > 0)
      } catch (err) {
        // Ignore errors for suggestions
      }
    }

    const timer = setTimeout(fetchSuggestions, 300) // Debounce 300ms
    return () => clearTimeout(timer)
  }, [company, api])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && suggestionsRef.current && 
          !searchRef.current.contains(e.target) && 
          !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onSearch = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    setShowSuggestions(false)
    try {
      const res = await api.get('/api/questions', { params: company ? { company } : {} })
      setResults(res.data)
    } catch (err) {
      setError('Failed to fetch questions')
    } finally {
      setLoading(false)
    }
  }

  const selectSuggestion = (suggestion) => {
    setCompany(suggestion)
    setShowSuggestions(false)
    // Auto-search when selecting a suggestion
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/api/questions')
        setLatest(res.data.slice(0, 5))
      } catch (e) {
        // ignore
      }
    }
    fetchLatest()
  }, [])

  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-4">Find Company Questions</h1>
      {user?.role === 'admin' && (
        <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
          {`Logged in as ${user?.name || 'admin'} (admin)`}
        </div>
      )}
      <form className="flex gap-2 mb-6 relative" onSubmit={onSearch}>
        <div className="flex-1 relative" ref={searchRef}>
          <input 
            className="w-full border border-slate-700 bg-white text-black placeholder-gray-500 rounded px-3 py-2" 
            placeholder="Enter company name (e.g., Google)"  
            value={company} 
            onChange={e=>setCompany(e.target.value)}
            onFocus={() => company.trim().length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-black border border-slate-700 rounded shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, idx) => {
                const capitalized = suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
                return (
                  <button
                    key={idx}
                    type="button"
                    className="w-full text-left px-3 py-2 text-white hover:bg-slate-800 transition"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {capitalized}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <button className="bg-blue-600 text-white rounded px-4 py-2">Search</button>
      </form>
      {loading && <div className="text-white">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {results.length > 0 && (
        <div className="space-y-4">
          {groupByCompany(results).map(group => (
            <CompanyFolder key={group.company} company={group.company} questions={group.questions} />
          ))}
        </div>
      )}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3 text-white">Latest Questions</h2>
        {latest.length > 0 ? (
          <div className="space-y-4">
            {groupByCompany(latest).map(group => (
              <CompanyFolder key={group.company} company={group.company} questions={group.questions} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No questions yet</div>
        )}
      </div>
    </div>
  )
}

// Group questions by company name
function groupByCompany(questions) {
  const grouped = {}
  questions.forEach(q => {
    const company = q.company || 'Unknown'
    if (!grouped[company]) {
      grouped[company] = []
    }
    grouped[company].push(q)
  })
  return Object.entries(grouped).map(([company, questions]) => ({
    company,
    questions
  }))
}

// Company folder component with collapsible functionality
function CompanyFolder({ company, questions }) {
  const [isOpen, setIsOpen] = useState(true)
  const capitalized = company ? company.charAt(0).toUpperCase() + company.slice(1) : company
  const count = questions.length

  return (
    <div className="bg-black border border-slate-700 rounded">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-900 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{isOpen ? '📂' : '📁'}</span>
          <span className="font-semibold text-white">{capitalized}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full min-w-[2rem] text-center">{count}</span>
          <span className="text-gray-400 text-sm">{isOpen ? '▼' : '▶'}</span>
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-slate-700 p-2 space-y-2">
          {questions.map(q => <ResultItem key={q._id} q={q} />)}
        </div>
      )}
    </div>
  )
}

function ResultItem({ q }) {
  const base = getApiBaseUrl()
  const thumb = q.imageUrls?.[0]
  const src = thumb && (thumb.startsWith('http') ? thumb : `${base}${thumb}`)
  const capitalized = q.company ? q.company.charAt(0).toUpperCase() + q.company.slice(1) : q.company
  return (
    <Link to={`/questions/${q._id}`} className="block bg-slate-900 shadow rounded p-3 hover:bg-slate-800 transition border border-slate-700">
      <div className="flex items-start gap-3">
        {src && <img src={src} alt="thumb" className="w-20 h-20 object-cover rounded" />}
        <div className="flex-1">
          <div className="font-semibold text-white text-sm mb-1">{capitalized}</div>
          <div className="line-clamp-2 text-xs text-gray-300">{q.questionText}</div>
        </div>
      </div>
    </Link>
  )
}


