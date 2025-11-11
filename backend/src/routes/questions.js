import { Router } from 'express';
import { listQuestions, getQuestion, getCompanySuggestions } from '../controllers/questionController.js';

const router = Router();

router.get('/suggestions/companies', getCompanySuggestions);
router.get('/', listQuestions);
router.get('/:id', getQuestion);

export default router;


