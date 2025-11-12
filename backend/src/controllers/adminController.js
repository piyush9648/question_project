import Question from '../models/Question.js';
// Using Multer disk storage; no cloud upload here

export const addQuestion = async (req, res) => {
  try {
    const { company, title, functionName, questionText, solution, imageBlurSettings } = req.body;
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
    
    // Parse blur settings - default to all false if not provided or if array length doesn't match
    let blurSettings = [];
    if (imageBlurSettings) {
      try {
        const parsed = typeof imageBlurSettings === 'string' ? JSON.parse(imageBlurSettings) : imageBlurSettings;
        blurSettings = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        blurSettings = [];
      }
    }
    // Ensure blur settings array matches imageUrls length, defaulting to false
    while (blurSettings.length < imageUrls.length) {
      blurSettings.push(false);
    }
    blurSettings = blurSettings.slice(0, imageUrls.length);
    
    const created = await Question.create({ 
      company: normalizedCompany, 
      title: title?.trim() || '', 
      functionName: functionName?.trim() || '', 
      questionText, 
      solution, 
      imageUrls,
      imageBlurSettings: blurSettings
    });
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
    const { company, title, functionName, questionText, solution, imageBlurSettings } = req.body;
    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    if (company) q.company = company.trim().toLowerCase(); // Normalize to lowercase
    if (title !== undefined) q.title = title.trim() || '';
    if (functionName !== undefined) q.functionName = functionName.trim() || '';
    if (questionText) q.questionText = questionText;
    if (solution) q.solution = solution;
    
    // Handle image updates
    if (req.files && req.files.length > 0) {
      q.imageUrls = req.files.map(f => `/uploads/${f.filename}`);
      // Reset blur settings for new images if not provided
      if (imageBlurSettings === undefined) {
        q.imageBlurSettings = new Array(q.imageUrls.length).fill(false);
      }
    }
    
    // Update blur settings if provided
    if (imageBlurSettings !== undefined) {
      try {
        const parsed = typeof imageBlurSettings === 'string' ? JSON.parse(imageBlurSettings) : imageBlurSettings;
        if (Array.isArray(parsed)) {
          // Ensure array length matches imageUrls length
          const blurSettings = [...parsed];
          while (blurSettings.length < q.imageUrls.length) {
            blurSettings.push(false);
          }
          q.imageBlurSettings = blurSettings.slice(0, q.imageUrls.length);
        }
      } catch (e) {
        // If parsing fails, keep existing settings or default to all false
        if (!q.imageBlurSettings || q.imageBlurSettings.length !== q.imageUrls.length) {
          q.imageBlurSettings = new Array(q.imageUrls.length).fill(false);
        }
      }
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


