import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: '' },
    functionName: { type: String, trim: true, default: '' },
    questionText: { type: String, required: true },
    solution: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    imageBlurSettings: { type: [Boolean], default: [] }
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;


