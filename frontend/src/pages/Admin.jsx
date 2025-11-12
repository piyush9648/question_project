import { useMemo, useState, useRef } from 'react'
import { useAuth } from '../state/AuthContext.jsx'
import { createClient } from '../lib/api.js'

export default function Admin() {
  const { token } = useAuth()
  const api = useMemo(() => createClient(token), [token])
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [functionName, setFunctionName] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [solution, setSolution] = useState('')
  const [images, setImages] = useState([])
  const [imageBlurSettings, setImageBlurSettings] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setLoading(true)
    
    if (!company.trim() || !questionText.trim() || !solution.trim()) {
      setStatus('❌ All fields are required')
      setLoading(false)
      return
    }
    
    const form = new FormData()
    form.append('company', company.trim())
    form.append('title', title.trim())
    form.append('functionName', functionName.trim())
    form.append('questionText', questionText.trim())
    form.append('solution', solution.trim())
    // Append all images with the same field name 'images' for array upload
    images.forEach((file) => {
      form.append('images', file)
    })
    // Append blur settings as JSON string
    form.append('imageBlurSettings', JSON.stringify(imageBlurSettings))
    
    console.log(`Sending ${images.length} image(s) to server`)
    
    try {
      // Don't set Content-Type header - let axios/browser set it with boundary
      const res = await api.post('/api/admin/questions', form)
      setCompany('')
      setTitle('')
      setFunctionName('')
      setQuestionText('')
      setSolution('')
      setImages([])
      setImageBlurSettings([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setStatus('✅ Question added successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add question'
      setStatus(`❌ Error: ${msg}`)
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-black border border-slate-700 rounded p-5">
        <h2 className="text-2xl font-semibold mb-4 text-white">Add Question</h2>
        {status && <div className="mb-4 text-sm text-gray-300">{status}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Company" value={company} onChange={e=>setCompany(e.target.value)} />
          <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <input className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2" placeholder="Function Name" value={functionName} onChange={e=>setFunctionName(e.target.value)} />
          <textarea className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2 h-28" placeholder="Question text" value={questionText} onChange={e=>setQuestionText(e.target.value)} />
          <textarea className="w-full border border-slate-700 bg-black text-white placeholder-gray-400 rounded px-3 py-2 h-28" placeholder="Solution text" value={solution} onChange={e=>setSolution(e.target.value)} />
          
          <div>
            <label className="block text-white mb-2">Images ({images.length} selected)</label>
            <input ref={fileInputRef} className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white text-white" type="file" accept="image/*" multiple onChange={e=>{
              const newImages = Array.from(e.target.files)
              setImages(newImages)
              // Initialize blur settings for new images (default to false)
              setImageBlurSettings(new Array(newImages.length).fill(false))
            }} />
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${idx + 1}`}
                      className={`w-full h-24 object-cover rounded border border-slate-700 ${imageBlurSettings[idx] ? 'blur-sm' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== idx)
                        const newBlurSettings = imageBlurSettings.filter((_, i) => i !== idx)
                        setImages(newImages)
                        setImageBlurSettings(newBlurSettings)
                        const dt = new DataTransfer()
                        newImages.forEach(img => dt.items.add(img))
                        if (fileInputRef.current) fileInputRef.current.files = dt.files
                      }}
                    >
                      ×
                    </button>
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
                    <div className="text-xs text-gray-400 mt-1 truncate">{file.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </form>
      </div>
    </div>
  )
}


