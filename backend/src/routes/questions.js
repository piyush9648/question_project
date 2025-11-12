import { Router } from 'express';
import { listQuestions, getQuestion, getCompanySuggestions, getFunctionNameSuggestions } from '../controllers/questionController.js';

const router = Router();

router.get('/suggestions/companies', getCompanySuggestions);
router.get('/suggestions/functionNames', getFunctionNameSuggestions);
router.get('/', listQuestions);
router.get('/:id', getQuestion);

export default router;


