import Question from '../models/Question.js';

export const listQuestions = async (req, res) => {
  try {
    const { company } = req.query;
    let filter = {};
    
    if (company && company.trim()) {
      // Convert search term to lowercase and escape special regex characters
      const searchTerm = company.trim().toLowerCase();
      // Escape special regex characters but allow * for wildcard matching
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      
      // Use case-insensitive regex for flexible matching
      // This allows partial matches and handles typos
      filter = {
        company: {
          $regex: escapedTerm,
          $options: 'i' // case-insensitive
        }
      };
    }
    
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    return res.json(questions);
  } catch (err) {
    console.error('List questions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Not found' });
    return res.json(q);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getCompanySuggestions = async (req, res) => {
  try {
    const { q } = req.query; // search query
    let filter = {};
    
    if (q && q.trim()) {
      const searchTerm = q.trim().toLowerCase();
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      filter = {
        company: {
          $regex: escapedTerm,
          $options: 'i'
        }
      };
    }
    
    // Get distinct company names matching the filter
    const companies = await Question.distinct('company', filter);
    // Limit to 10 suggestions and sort alphabetically
    const suggestions = companies.slice(0, 10).sort();
    return res.json(suggestions);
  } catch (err) {
    console.error('Get company suggestions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


