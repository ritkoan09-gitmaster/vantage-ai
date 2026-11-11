import mongoose from 'mongoose';

const SnippetSchema = new mongoose.Schema({
  snippetId: { type: String, required: true, unique: true }, 
  username: { type: String, required: true }, // Ye snippet kis user ka hai
  title: { type: String, required: true },
  description: { type: String, default: '' },
  language: { type: String, required: true },
  code: { type: String, required: true },
  tags: { type: [String], default: [] },
  starred: { type: Boolean, default: false },
  copies: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  xray: { type: Object, default: null }
}, { timestamps: true });

export const Snippet = mongoose.models.Snippet || mongoose.model('Snippet', SnippetSchema);