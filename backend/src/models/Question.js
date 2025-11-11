import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    questionText: { type: String, required: true },
    solution: { type: String, required: true },
    imageUrls: { type: [String], default: [] }
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;


