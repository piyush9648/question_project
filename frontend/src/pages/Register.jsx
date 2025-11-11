import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createClient } from '../lib/api.js'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const api = createClient()
      await api.post('/api/auth/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-black border border-slate-700 rounded p-6">
        <h2 className="text-2xl font-semibold mb-6 text-white">Create an account</h2>
        {error && <div className="bg-red-900/30 text-red-300 p-2 rounded mb-4">{error}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white rounded px-3 py-2">Register</button>
        </form>
        <p className="mt-4 text-sm text-gray-300">Already have an account? <Link to="/login" className="text-blue-400">Login</Link></p>
      </div>
    </div>
  )
}


