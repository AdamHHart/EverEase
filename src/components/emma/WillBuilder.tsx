import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Upload, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { sendClaudeMessage, EMMA_PLANNER_SYSTEM_PROMPT } from '../../lib/claude';
import EmmaAvatar from './EmmaAvatar';
import DocumentScanner from '../DocumentScanner';

interface WillBuilderProps {
  onComplete: (willData: any) => void;
  onBack?: () => void;
}

export default function WillBuilder({ onComplete, onBack }: WillBuilderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [willContent, setWillContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScannedImage(null);
    }
  };

  const handleCapture = (imageData: string) => {
    setScannedImage(imageData);
    setShowScanner(false);
    setSelectedFile(null);
  };

  const analyzeWill = async () => {
    if (!selectedFile && !scannedImage) return;

    setIsAnalyzing(true);
    try {
      const analysisPrompt = `I've uploaded a will document. Please analyze it and provide:
1. A summary of the key provisions
2. Any potential gaps or missing elements
3. Suggestions for improvement
4. Whether it appears to be legally complete

Please be encouraging and focus on what's working well while gently suggesting improvements.`;

      const response = await sendClaudeMessage(
        [{ role: 'user', content: analysisPrompt }],
        EMMA_PLANNER_SYSTEM_PROMPT + "\n\nYou are analyzing a will document. Be thorough but encouraging."
      );

      setAnalysisResult(response);
    } catch (error) {
      console.error('Error analyzing will:', error);
      setAnalysisResult("I had trouble analyzing that document, but no worries! The important thing is you have a will. We can always review and improve it later. You're already ahead of most people! 🎉");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateWillTemplate = async () => {
    setIsGenerating(true);
    try {
      const templatePrompt = `Help me create a basic will template. I need something simple but comprehensive that covers:
- Asset distribution
- Guardian designation (if applicable)
- Executor appointment
- Basic legal language

Please provide a template I can customize with my specific information.`;

      const response = await sendClaudeMessage(
        [{ role: 'user', content: templatePrompt }],
        EMMA_PLANNER_SYSTEM_PROMPT + "\n\nYou are helping create a will template. Provide a comprehensive but simple template with clear placeholders for customization. Include encouraging notes about each section."
      );

      setWillContent(response);
    } catch (error) {
      console.error('Error generating will template:', error);
      setWillContent("Let's start with a basic template! I'll help you build this step by step...");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    const willData = {
      type: activeTab,
      hasFile: !!(selectedFile || scannedImage),
      fileName: selectedFile?.name || 'Scanned Will',
      content: willContent,
      analysis: analysisResult,
      completedAt: new Date().toISOString()
    };

    onComplete(willData);
  };

  return (
    <>
      {showScanner && (
        <DocumentScanner
          onCapture={handleCapture}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <EmmaAvatar size="lg" mood="celebrating" />
          <div>
            <h2 className="text-2xl font-bold">Alright superstar, let's tackle your will first! 🚀</h2>
            <p className="text-gray-600">
              This is the foundation of everything! I'm going to make this SUPER simple for you. 
              Since you're here being proactive, I'm betting you might already have something!
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Will - The Foundation of Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">🚀 Here are your two paths:</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div><strong>FAST TRACK:</strong> Upload your existing will (even if it's old or needs updates - we can fix it later!)</div>
                <div><strong>BUILD TOGETHER:</strong> I'll walk you through creating a simple will right now (takes about 10 minutes)</div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'create')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Existing Will
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Create New Will
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">✨ Already Have a Will? Perfect!</h3>
                  <p className="text-sm text-green-800">
                    Upload your existing will and I'll help you review it to make sure it's complete and up-to-date. 
                    You're already winning by having one!
                  </p>
                </div>

                <div className="space-y-4">
                  {scannedImage ? (
                    <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={scannedImage} 
                        alt="Scanned will" 
                        className="w-full h-full object-contain"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setScannedImage(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : selectedFile ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <h3 className="font-medium">Upload Your Will</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            PDF, Word document, or scan/photo of your will
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Input
                            type="file"
                            accept="image/*,application/pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="max-w-xs"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setShowScanner(true)}
                          >
                            📱 Scan
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedFile || scannedImage) && !analysisResult && (
                    <Button 
                      onClick={analyzeWill}
                      disabled={isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? 'Emma is reviewing your will...' : '🔍 Let Emma Review This!'}
                    </Button>
                  )}

                  {analysisResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-900">Emma's Analysis</h3>
                      </div>
                      <div className="text-sm text-green-800 whitespace-pre-wrap">
                        {analysisResult}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-6 mt-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-medium text-amber-900 mb-2">🌟 Let's Create Your Will Together!</h3>
                  <p className="text-sm text-amber-800">
                    No will yet? No problem! I'll help you create one that covers all the important stuff. 
                    We'll start with a solid template and customize it for you.
                  </p>
                </div>

                <div className="space-y-4">
                  {!willContent && (
                    <div className="text-center py-8">
                      <Sparkles className="h-12 w-12 text-calm-500 mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Ready to Create Your Will?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        I'll generate a comprehensive template that you can customize with your specific wishes.
                      </p>
                      <Button 
                        onClick={generateWillTemplate}
                        disabled={isGenerating}
                        className="bg-calm-500 hover:bg-calm-600"
                      >
                        {isGenerating ? 'Emma is creating your template...' : '✨ Generate Will Template'}
                      </Button>
                    </div>
                  )}

                  {willContent && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Your Will Template</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateWillTemplate}
                          disabled={isGenerating}
                        >
                          🔄 Regenerate
                        </Button>
                      </div>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[400px] font-mono text-sm"
                        value={willContent}
                        onChange={(e) => setWillContent(e.target.value)}
                        placeholder="Your will content will appear here..."
                      />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Emma's Tip</h4>
                        <p className="text-sm text-blue-800">
                          This template gives you a great starting point! Feel free to customize it with your specific wishes. 
                          Remember, you can always update this later - the important thing is getting started!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 mt-8">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleComplete}
                disabled={
                  (activeTab === 'upload' && !selectedFile && !scannedImage) ||
                  (activeTab === 'create' && !willContent.trim())
                }
                className="flex-1 bg-calm-500 hover:bg-calm-600"
              >
                🎉 Will Complete - Next Step!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}