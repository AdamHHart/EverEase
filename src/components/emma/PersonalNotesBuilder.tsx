import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Heart, Edit, Trash2, Plus, MessageCircle } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';
import { sendClaudeMessage, EMMA_PLANNER_SYSTEM_PROMPT } from '../../lib/claude';

interface Note {
  id: string;
  executorName: string;
  executorEmail: string;
  content: string;
}

interface PersonalNotesBuilderProps {
  onComplete: (notesData: any) => void;
  onBack?: () => void;
  executors?: Array<{id: string, name: string, email: string}>;
}

export default function PersonalNotesBuilder({ onComplete, onBack, executors = [] }: PersonalNotesBuilderProps) {
  const [notes, setNotes] = useState<Note[]>(
    executors.length > 0 
      ? executors.map(executor => ({
          id: executor.id,
          executorName: executor.name,
          executorEmail: executor.email,
          content: ''
        }))
      : [{
          id: '1',
          executorName: '',
          executorEmail: '',
          content: ''
        }]
  );
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '1');
  const [isGenerating, setIsGenerating] = useState(false);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      executorName: '',
      executorEmail: '',
      content: ''
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
  };

  const removeNote = (id: string) => {
    if (notes.length > 1) {
      const newNotes = notes.filter(note => note.id !== id);
      setNotes(newNotes);
      if (activeNoteId === id) {
        setActiveNoteId(newNotes[0].id);
      }
    }
  };

  const updateNote = (id: string, field: keyof Note, value: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, [field]: value } : note
    ));
  };

  const generateNoteContent = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setIsGenerating(true);
    try {
      const prompt = `I want to write a heartfelt personal note to my executor, ${note.executorName || 'my executor'}. 
      This person will be responsible for carrying out my final wishes. 
      I want to express my gratitude for their willingness to take on this role, 
      reassure them that I've tried to organize everything to make their job easier, 
      and let them know how much I trust and appreciate them.
      
      Please draft a personal, warm message that I can customize further.`;

      const response = await sendClaudeMessage(
        [{ role: 'user', content: prompt }],
        EMMA_PLANNER_SYSTEM_PROMPT + "\n\nYou are helping write a heartfelt personal note to an executor. Be warm, personal, and emotionally supportive while maintaining a positive tone."
      );

      updateNote(noteId, 'content', response);
    } catch (error) {
      console.error('Error generating note content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    const validNotes = notes.filter(note => 
      note.executorName.trim() && note.content.trim()
    );
    
    onComplete({
      notes: validNotes,
      completedAt: new Date().toISOString()
    });
  };

  const activeNote = notes.find(note => note.id === activeNoteId) || notes[0];
  const isValid = notes.some(note => note.executorName.trim() && note.content.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EmmaAvatar size="lg" mood="celebrating" />
        <div>
          <h2 className="text-2xl font-bold">BOOM! Executors: SET UP! 🔥</h2>
          <p className="text-gray-600">
            Now for the most beautiful part - your personal messages to them. This is where you get to tell 
            each person how much they mean to you and give them any special guidance.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-calm-500" />
            Personal Notes for Your Executors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
                <h3 className="font-medium text-calm-900 mb-2">Your Messages</h3>
                <p className="text-sm text-calm-700 mb-4">
                  These personal notes will comfort and guide your executors when they need to step into their role.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={addNote}
                >
                  <Plus className="h-4 w-4" />
                  Add Another Note
                </Button>
              </div>

              <div className="space-y-2">
                {notes.map(note => (
                  <div 
                    key={note.id}
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                      note.id === activeNoteId 
                        ? 'bg-calm-100 border border-calm-300' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveNoteId(note.id)}
                  >
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">
                        {note.executorName || 'Unnamed Recipient'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {note.content ? `${note.content.substring(0, 30)}...` : 'No content yet'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              {activeNote && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipient Name *</label>
                      <Input
                        value={activeNote.executorName}
                        onChange={(e) => updateNote(activeNote.id, 'executorName', e.target.value)}
                        placeholder="Enter recipient's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipient Email</label>
                      <Input
                        type="email"
                        value={activeNote.executorEmail}
                        onChange={(e) => updateNote(activeNote.id, 'executorEmail', e.target.value)}
                        placeholder="Enter recipient's email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Message Content *</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateNoteContent(activeNote.id)}
                        disabled={isGenerating}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {isGenerating ? 'Generating...' : 'Help Me Write This'}
                      </Button>
                    </div>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[300px]"
                      value={activeNote.content}
                      onChange={(e) => updateNote(activeNote.id, 'content', e.target.value)}
                      placeholder="Write your personal message here..."
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">💡 Emma's Writing Tips</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Express your gratitude for their willingness to serve</li>
                      <li>• Reassure them that you've organized things to make their job easier</li>
                      <li>• Share why you specifically chose them for this important role</li>
                      <li>• Include any personal messages or memories you want to share</li>
                      <li>• Let them know it's okay to ask for help from professionals</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button 
              onClick={handleComplete}
              disabled={!isValid}
              className="flex-1 bg-calm-500 hover:bg-calm-600"
            >
              🎉 Personal Notes Complete - Keep Going!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}