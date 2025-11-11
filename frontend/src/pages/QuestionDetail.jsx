import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createClient, getApiBaseUrl } from '../lib/api.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function QuestionDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const api = useMemo(() => createClient(token), [token])
  const [q, setQ] = useState(null)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(false)
  const [company, setCompany] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [solution, setSolution] = useState('')
  const [images, setImages] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/questions/${id}`)
        setQ(res.data)
        setCompany(res.data.company)
        setQuestionText(res.data.questionText)
        setSolution(res.data.solution)
      } catch (e) {
        setError('Failed to load question')
      }
    }
    load()
  }, [id])

  if (error) return <div className="py-8 text-red-600">{error}</div>
  if (!q) return <div className="py-8">Loading...</div>

  return (
    <div className="py-8">
      <div className="bg-black border border-slate-700 rounded p-4">
        <div className="inline-block mb-3 rounded border border-amber-600 bg-amber-900/20 px-3 py-1">
          <span className="font-bold text-amber-400">{q.company ? q.company.charAt(0).toUpperCase() + q.company.slice(1) : q.company}</span>
        </div>
        <div className="whitespace-pre-wrap mb-4 text-gray-200">{q.questionText}</div>
        <div className="border-t border-slate-700 my-4" />

        {q.imageUrls?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-white">Images ({q.imageUrls.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {q.imageUrls.map((url, i) => {
              const base = getApiBaseUrl()
              const src = url.startsWith('http') ? url : `${base}${url}`
              return (
                <a 
                  key={i} 
                  href={src} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group relative block"
                >
                  <img 
                    src={src} 
                    alt={`Question image ${i + 1}`}
                    className="w-full h-40 object-cover rounded border border-slate-700 hover:border-blue-500 transition"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded flex items-center justify-center">
                    <span className="text-white text-sm opacity-0 group-hover:opacity-100">View Full</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {i + 1}/{q.imageUrls.length}
                  </div>
                </a>
              )
            })}
          </div>
            <div className="border-t border-slate-700 mt-6" />
        </div>
      )}

        <div className="flex items-center gap-3 mb-3">
          <button className="text-blue-400" onClick={()=>setShow(s=>!s)}>{show ? 'Hide Solution' : 'Show Solution'}</button>
          {user?.role === 'admin' && (
            <>
              <button className="text-amber-400" onClick={()=>setEditing(e=>!e)}>{editing ? 'Cancel Edit' : 'Edit'}</button>
              <button className="text-red-400" onClick={async()=>{
                if (!confirm('Delete this question?')) return
                try {
                  await api.delete(`/api/admin/questions/${q._id}`)
                  navigate('/questions')
                } catch (e) {
                  alert('Failed to delete')
                }
              }}>Delete</button>
            </>
          )}
        </div>
        {show && (
          <>
            <div className="border-t border-slate-700 my-4" />
            <div className="bg-black border border-slate-700 rounded p-3 whitespace-pre-wrap text-gray-200">{q.solution}</div>
          </>
        )}

        {editing && user?.role === 'admin' && (
          <div className="mt-6 bg-black border border-slate-700 rounded p-4">
            <h3 className="font-semibold mb-3 text-white">Edit Question</h3>
            <div className="space-y-3">
              <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" value={company} onChange={e=>setCompany(e.target.value)} />
              <textarea className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2 h-28" value={questionText} onChange={e=>setQuestionText(e.target.value)} />
              <textarea className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2 h-28" value={solution} onChange={e=>setSolution(e.target.value)} />
              <div>
                <label className="block text-white mb-2">Images ({images.length > 0 ? images.length : q.imageUrls?.length || 0} total)</label>
                <input className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white text-white" type="file" accept="image/*" multiple onChange={e=>setImages(Array.from(e.target.files))} />
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded border border-slate-700"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                        <div className="text-xs text-gray-400 mt-1 truncate">{file.name}</div>
                      </div>
                    ))}
                  </div>
                )}
                {q.imageUrls?.length > 0 && images.length === 0 && (
                  <div className="mt-3 text-sm text-gray-400">
                    Current images: {q.imageUrls.length}. Upload new images to replace them.
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white rounded px-4 py-2" onClick={async()=>{
                  const form = new FormData()
                  form.append('company', company)
                  form.append('questionText', questionText)
                  form.append('solution', solution)
                  // Append all images with the same field name 'images' for array upload
                  images.forEach(f => form.append('images', f))
                  console.log(`Sending ${images.length} image(s) for update`)
                  try {
                    // Don't set Content-Type header - let axios/browser set it with boundary
                    const res = await api.put(`/api/admin/questions/${q._id}`, form)
                    setQ(res.data)
                    setEditing(false)
                    setImages([])
                  } catch (e) {
                    console.error('Update error:', e)
                    alert('Failed to update: ' + (e.response?.data?.message || e.message))
                  }
                }}>Save</button>
                <button className="border border-slate-700 text-white rounded px-4 py-2" onClick={()=>{setEditing(false); setImages([])}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


