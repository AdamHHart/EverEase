import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Users, Plus, Trash2, Mail, Phone, Heart } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';
import { sendClaudeMessage, EMMA_PLANNER_SYSTEM_PROMPT } from '../../lib/claude';

interface Executor {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface ExecutorSelectorProps {
  onComplete: (executors: Executor[]) => void;
  onBack?: () => void;
}

export default function ExecutorSelector({ onComplete, onBack }: ExecutorSelectorProps) {
  const [executors, setExecutors] = useState<Executor[]>([
    {
      id: '1',
      name: '',
      email: '',
      phone: '',
      relationship: '',
      isPrimary: true
    }
  ]);
  const [emmaAdvice, setEmmaAdvice] = useState<string | null>(null);
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);

  const addExecutor = () => {
    const newExecutor: Executor = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      relationship: '',
      isPrimary: false
    };
    setExecutors([...executors, newExecutor]);
  };

  const removeExecutor = (id: string) => {
    if (executors.length > 1) {
      setExecutors(executors.filter(e => e.id !== id));
    }
  };

  const updateExecutor = (id: string, field: keyof Executor, value: string | boolean) => {
    setExecutors(executors.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const setPrimary = (id: string) => {
    setExecutors(executors.map(e => ({
      ...e,
      isPrimary: e.id === id
    })));
  };

  const getExecutorAdvice = async () => {
    setIsGettingAdvice(true);
    try {
      const executorInfo = executors.map(e => 
        `${e.isPrimary ? 'Primary' : 'Backup'} Executor: ${e.name || 'Not named'} (${e.relationship || 'Relationship not specified'})`
      ).join('\n');

      const advicePrompt = `I'm choosing my executors. Here's who I'm considering:

${executorInfo}

Can you give me some encouraging advice about my choices and any suggestions for what makes a good executor? I want to make sure I'm making good decisions for my family.`;

      const response = await sendClaudeMessage(
        [{ role: 'user', content: advicePrompt }],
        EMMA_PLANNER_SYSTEM_PROMPT + "\n\nYou are providing advice about executor selection. Be encouraging and provide practical guidance about what makes a good executor."
      );

      setEmmaAdvice(response);
    } catch (error) {
      console.error('Error getting executor advice:', error);
      setEmmaAdvice("You're doing great thinking carefully about your executor choices! The most important thing is choosing someone you trust completely. They should be organized, responsible, and willing to take on this important role. You've got this! 💪");
    } finally {
      setIsGettingAdvice(false);
    }
  };

  const handleComplete = () => {
    const validExecutors = executors.filter(e => 
      e.name.trim() && e.email.trim()
    );
    onComplete(validExecutors);
  };

  const isValid = executors.some(e => e.name.trim() && e.email.trim() && e.isPrimary);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EmmaAvatar size="lg" mood="celebrating" />
        <div>
          <h2 className="text-2xl font-bold">BOOM! Will status: HANDLED! 🔥</h2>
          <p className="text-gray-600">
            Look at you go! Now let's get your dream team set up - your executors! 
            These are the amazing people who'll make sure your wishes are followed perfectly.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-calm-500" />
            Your Dream Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
            <h3 className="font-medium text-calm-900 mb-2">🌟 Here's what makes a GREAT executor:</h3>
            <ul className="text-sm text-calm-800 space-y-1">
              <li>✅ Someone you trust completely</li>
              <li>✅ Lives nearby or can travel when needed</li>
              <li>✅ Good with paperwork and details</li>
              <li>✅ Emotionally strong enough to handle this responsibility</li>
            </ul>
            <p className="text-sm text-calm-800 mt-3">
              <strong>I'm thinking your top candidates are probably:</strong> Your spouse/partner, adult children, close siblings, or that super organized best friend!
            </p>
          </div>

          <div className="space-y-4">
            {executors.map((executor, index) => (
              <div key={executor.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {executor.isPrimary ? '⭐ Primary Executor' : '🔄 Backup Executor'}
                    </h3>
                    {!executor.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(executor.id)}
                      >
                        Make Primary
                      </Button>
                    )}
                  </div>
                  {executors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExecutor(executor.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input
                      value={executor.name}
                      onChange={(e) => updateExecutor(executor.id, 'name', e.target.value)}
                      placeholder="Enter their full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Relationship</label>
                    <Input
                      value={executor.relationship}
                      onChange={(e) => updateExecutor(executor.id, 'relationship', e.target.value)}
                      placeholder="e.g., Spouse, Child, Sibling, Friend"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={executor.email}
                        onChange={(e) => updateExecutor(executor.id, 'email', e.target.value)}
                        placeholder="their.email@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={executor.phone}
                        onChange={(e) => updateExecutor(executor.id, 'phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={addExecutor}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Backup Executor
            </Button>
            <Button
              variant="outline"
              onClick={getExecutorAdvice}
              disabled={isGettingAdvice}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              {isGettingAdvice ? 'Getting Emma\'s advice...' : 'Get Emma\'s Advice'}
            </Button>
          </div>

          {emmaAdvice && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <EmmaAvatar size="sm" mood="encouraging" />
                <h3 className="font-medium text-green-900">Emma's Advice</h3>
              </div>
              <div className="text-sm text-green-800 whitespace-pre-wrap">
                {emmaAdvice}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-amber-800">
              Having a backup executor is super smart! If your primary executor can't serve for any reason, 
              your backup steps in seamlessly. You're really thinking ahead! 🎯
            </p>
          </div>

          <div className="flex gap-3">
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
              🎉 Executors Selected - Keep Going!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}