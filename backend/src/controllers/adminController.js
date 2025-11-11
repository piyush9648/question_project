import Question from '../models/Question.js';
// Using Multer disk storage; no cloud upload here

export const addQuestion = async (req, res) => {
  try {
    const { company, questionText, solution } = req.body;
    if (!company || !questionText || !solution) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Normalize company name to lowercase for consistent searching
    const normalizedCompany = company.trim().toLowerCase();
    let imageUrls = [];
    
    // Debug: Check what we received
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Files array:', req.files ? req.files.map(f => f.filename) : 'none');
    
    if (req.files && req.files.length > 0) {
      // Files saved by Multer to /uploads; expose as /uploads/<filename>
      imageUrls = req.files.map(f => `/uploads/${f.filename}`)
      console.log(`✅ Uploaded ${req.files.length} image(s) for question:`, imageUrls);
    } else {
      console.log('⚠️ No images received');
    }
    
    const created = await Question.create({ company: normalizedCompany, questionText, solution, imageUrls });
    console.log(`✅ Question created: ${created._id} for company: ${normalizedCompany} with ${imageUrls.length} images`);
    return res.status(201).json(created);
  } catch (err) {
    console.error('❌ Add question error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, questionText, solution } = req.body;
    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    if (company) q.company = company.trim().toLowerCase(); // Normalize to lowercase
    if (questionText) q.questionText = questionText;
    if (solution) q.solution = solution;
    if (req.files && req.files.length > 0) {
      q.imageUrls = req.files.map(f => `/uploads/${f.filename}`);
    }
    await q.save();
    return res.json(q);
  } catch (err) {
    console.error('Update question error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await Question.findByIdAndDelete(id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete question error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const checkAdmin = async (req, res) => {
  return res.json({ isAdmin: req.user?.role === 'admin' });
};


