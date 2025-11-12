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
  const [title, setTitle] = useState('')
  const [functionName, setFunctionName] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [solution, setSolution] = useState('')
  const [images, setImages] = useState([])
  const [imageBlurSettings, setImageBlurSettings] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/questions/${id}`)
        setQ(res.data)
        setCompany(res.data.company)
        setTitle(res.data.title || '')
        setFunctionName(res.data.functionName || '')
        setQuestionText(res.data.questionText)
        setSolution(res.data.solution)
        setImageBlurSettings(res.data.imageBlurSettings || [])
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
        {(q.title || q.functionName) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {q.title && (
              <div className="inline-flex flex-col gap-1 rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-700/20 to-fuchsia-600/10 px-3 py-2 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                <span className="text-[10px] uppercase tracking-widest text-purple-200/80">Title</span>
                <span className="text-base font-semibold text-purple-200">{q.title}</span>
              </div>
            )}
            {q.functionName && (
              <div className="inline-flex flex-col gap-1 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-600/20 to-sky-500/10 px-3 py-2 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                <span className="text-[10px] uppercase tracking-widest text-cyan-200/80">Function</span>
                <span className="text-base font-semibold text-cyan-200">{q.functionName}</span>
              </div>
            )}
          </div>
        )}
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
              const isAdmin = user?.role === 'admin'
              const shouldBlur = !isAdmin && (q.imageBlurSettings?.[i] === true)
              const imageContent = (
                <>
                  <img 
                    src={src} 
                    alt={`Question image ${i + 1}`}
                    className={`w-full h-40 object-cover rounded border border-slate-700 transition ${shouldBlur ? 'blur-md pointer-events-none' : isAdmin ? 'hover:border-blue-500' : ''}`}
                  />
                  {isAdmin && !shouldBlur && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded flex items-center justify-center">
                      <span className="text-white text-sm opacity-0 group-hover:opacity-100">View Full</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {i + 1}/{q.imageUrls.length}
                  </div>
                </>
              )
              return isAdmin && !shouldBlur ? (
                <a 
                  key={i} 
                  href={src} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group relative block"
                >
                  {imageContent}
                </a>
              ) : (
                <div 
                  key={i} 
                  className="relative block"
                >
                  {imageContent}
                </div>
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
            {user?.role === 'admin' ? (
              <div className="bg-black border border-slate-700 rounded p-3 whitespace-pre-wrap text-gray-200">{q.solution}</div>
            ) : (
              <div className="bg-black border border-slate-700 rounded p-3 text-gray-200">
                For Solutions DM : <a href="https://t.me/Oahelp9026" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">https://t.me/Oahelp9026</a>
              </div>
            )}
          </>
        )}

        {editing && user?.role === 'admin' && (
          <div className="mt-6 bg-black border border-slate-700 rounded p-4">
            <h3 className="font-semibold mb-3 text-white">Edit Question</h3>
            <div className="space-y-3">
              <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Company" value={company} onChange={e=>setCompany(e.target.value)} />
              <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
              <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Function Name" value={functionName} onChange={e=>setFunctionName(e.target.value)} />
              <textarea className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2 h-28" placeholder="Question text" value={questionText} onChange={e=>setQuestionText(e.target.value)} />
              <textarea className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2 h-28" placeholder="Solution text" value={solution} onChange={e=>setSolution(e.target.value)} />
              <div>
                <label className="block text-white mb-2">Images ({images.length > 0 ? images.length : q.imageUrls?.length || 0} total)</label>
                <input className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white text-white" type="file" accept="image/*" multiple onChange={e=>{
                  const newImages = Array.from(e.target.files)
                  setImages(newImages)
                  // Initialize blur settings for new images (default to false)
                  if (newImages.length > 0) {
                    const existingBlurSettings = imageBlurSettings.slice(0, q.imageUrls?.length || 0)
                    const newBlurSettings = new Array(newImages.length).fill(false)
                    setImageBlurSettings([...existingBlurSettings, ...newBlurSettings])
                  }
                }} />
                {q.imageUrls?.length > 0 && images.length === 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-400 mb-2">Current images:</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {q.imageUrls.map((url, idx) => {
                        const base = getApiBaseUrl()
                        const src = url.startsWith('http') ? url : `${base}${url}`
                        return (
                          <div key={idx} className="relative">
                            <img 
                              src={src} 
                              alt={`Current ${idx + 1}`}
                              className={`w-full h-24 object-cover rounded border border-slate-700 ${imageBlurSettings[idx] ? 'blur-sm' : ''}`}
                            />
                            <div className="absolute bottom-8 left-1 right-1">
                              <label className="flex items-center gap-1 bg-black bg-opacity-70 rounded px-1 py-0.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={imageBlurSettings[idx] || false}
                                  onChange={(e) => {
                                    const newSettings = [...imageBlurSettings]
                                    newSettings[idx] = e.target.checked
                                    setImageBlurSettings(newSettings)
                                  }}
                                  className="w-3 h-3"
                                />
                                <span className="text-xs text-white">Blur</span>
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-400 mb-2">New images:</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {images.map((file, idx) => {
                        const blurIdx = (q.imageUrls?.length || 0) + idx
                        return (
                          <div key={idx} className="relative">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${idx + 1}`}
                              className={`w-full h-24 object-cover rounded border border-slate-700 ${imageBlurSettings[blurIdx] ? 'blur-sm' : ''}`}
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                              onClick={() => {
                                const newImages = images.filter((_, i) => i !== idx)
                                const newBlurSettings = imageBlurSettings.filter((_, i) => i !== blurIdx)
                                setImages(newImages)
                                setImageBlurSettings(newBlurSettings)
                              }}
                            >
                              ×
                            </button>
                            <div className="absolute bottom-8 left-1 right-1">
                              <label className="flex items-center gap-1 bg-black bg-opacity-70 rounded px-1 py-0.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={imageBlurSettings[blurIdx] || false}
                                  onChange={(e) => {
                                    const newSettings = [...imageBlurSettings]
                                    newSettings[blurIdx] = e.target.checked
                                    setImageBlurSettings(newSettings)
                                  }}
                                  className="w-3 h-3"
                                />
                                <span className="text-xs text-white">Blur</span>
                              </label>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 truncate">{file.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white rounded px-4 py-2" onClick={async()=>{
                  const form = new FormData()
                  form.append('company', company)
                  form.append('title', title)
                  form.append('functionName', functionName)
                  form.append('questionText', questionText)
                  form.append('solution', solution)
                  // Append all images with the same field name 'images' for array upload
                  images.forEach(f => form.append('images', f))
                  // Append blur settings as JSON string
                  // If uploading new images, only send blur settings for new images (they replace old ones)
                  // If not uploading new images, send blur settings for existing images
                  const blurSettingsToSend = images.length > 0 
                    ? imageBlurSettings.slice(q.imageUrls?.length || 0) // Only new images' blur settings
                    : imageBlurSettings.slice(0, q.imageUrls?.length || 0) // Only existing images' blur settings
                  form.append('imageBlurSettings', JSON.stringify(blurSettingsToSend))
                  console.log(`Sending ${images.length} image(s) for update`)
                  try {
                    // Don't set Content-Type header - let axios/browser set it with boundary
                    const res = await api.put(`/api/admin/questions/${q._id}`, form)
                    setQ(res.data)
                    setEditing(false)
                    setImages([])
                    setImageBlurSettings(res.data.imageBlurSettings || [])
                  } catch (e) {
                    console.error('Update error:', e)
                    alert('Failed to update: ' + (e.response?.data?.message || e.message))
                  }
                }}>Save</button>
                <button className="border border-slate-700 text-white rounded px-4 py-2" onClick={()=>{
                  setEditing(false)
                  setImages([])
                  setImageBlurSettings(q.imageBlurSettings || [])
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


