import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function Navbar() {
  const { token, setToken, user, setUser } = useAuth()
  const navigate = useNavigate()

  const logout = () => {
    setToken('')
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="bg-white/10 backdrop-blur shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-white">
        <Link to="/" className="font-semibold">Questions App</Link>
        <div className="flex items-center gap-4">
          <Link to="/">Home</Link>
          {token && <Link to="/questions">Questions</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button className="text-red-400" onClick={logout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}


