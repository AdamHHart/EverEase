import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  HelpCircle, 
  FileText, 
  Users, 
  FolderClosed, 
  HeartHandshake, 
  MessageCircle,
  Mail,
  ExternalLink
} from 'lucide-react';
import EmmaAvatar from '../components/emma/EmmaAvatar';
import PlannerChatInterface from '../components/emma/PlannerChatInterface';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [showEmma, setShowEmma] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-500 mt-1">Find answers to common questions and get assistance</p>
        </div>
        
        <Button 
          onClick={() => setShowEmma(!showEmma)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {showEmma ? 'Hide Emma' : 'Chat with Emma'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Us
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">What is Ever Ease?</h3>
                        <p className="text-gray-600">
                          Ever Ease is a secure platform for end-of-life planning. It helps you organize important documents, 
                          record your wishes, and designate executors who can access this information when needed.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">How secure is my information?</h3>
                        <p className="text-gray-600">
                          Your data is protected with end-to-end encryption. Only you and the executors you designate 
                          (when appropriate conditions are met) can access your information. We use industry-standard 
                          security measures to ensure your data remains private and secure.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">What is an executor?</h3>
                        <p className="text-gray-600">
                          An executor is someone you trust to carry out your wishes after you pass away. They will have 
                          access to your Ever Ease information and be responsible for managing your affairs according to 
                          your documented wishes.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">How do I add documents?</h3>
                        <p className="text-gray-600">
                          You can upload documents through the Documents section. We accept various file formats including 
                          PDFs, images, and text documents. You can also use your device's camera to scan physical documents.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">What happens when I designate an executor?</h3>
                        <p className="text-gray-600">
                          When you designate an executor, they'll receive an invitation email. They'll need to create an 
                          account (or sign in to their existing account) to accept the invitation. They won't have access 
                          to your information until the conditions you specify are met.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">How does Emma help me?</h3>
                        <p className="text-gray-600">
                          Emma is your AI planning assistant. She guides you through the planning process, helps you 
                          organize your information, and provides support and encouragement along the way. Emma also 
                          assists your executors when they need to access your information.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Can I update my information?</h3>
                        <p className="text-gray-600">
                          Yes, you can update your information at any time. We recommend reviewing your plan periodically 
                          to ensure it remains current, especially after major life events like marriage, divorce, births, 
                          or significant asset changes.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-calm-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <FolderClosed className="h-8 w-8 text-calm-500" />
                          <h3 className="text-lg font-medium">Managing Assets</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Learn how to document and organize your financial, physical, and digital assets.
                        </p>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-calm-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <FileText className="h-8 w-8 text-calm-500" />
                          <h3 className="text-lg font-medium">Document Management</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          How to upload, organize, and manage important documents in your vault.
                        </p>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-calm-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <HeartHandshake className="h-8 w-8 text-calm-500" />
                          <h3 className="text-lg font-medium">Documenting Wishes</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          How to record your medical directives, funeral preferences, and personal messages.
                        </p>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-calm-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Users className="h-8 w-8 text-calm-500" />
                          <h3 className="text-lg font-medium">Executor Management</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          How to designate executors and manage their access to your information.
                        </p>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Guide
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-calm-50 border border-calm-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-3">Email Support</h3>
                      <p className="text-gray-600 mb-4">
                        Our support team is available Monday through Friday, 9am to 5pm Eastern Time.
                        We typically respond within 24 hours.
                      </p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-calm-500" />
                        <a href="mailto:support@everease.com" className="text-calm-600 hover:underline">
                          support@everease.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-3">Knowledge Base</h3>
                      <p className="text-gray-600 mb-4">
                        Visit our comprehensive knowledge base for tutorials, guides, and answers to common questions.
                      </p>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Visit Knowledge Base
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-3">Send a Message</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject</label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            placeholder="What can we help you with?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Message</label>
                          <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[150px]"
                            placeholder="Please describe your issue or question in detail..."
                          />
                        </div>
                        <Button>Send Message</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          {showEmma ? (
            <Card className="h-full">
              <CardHeader className="pb-3 bg-gradient-to-r from-calm-100 to-calm-50 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <EmmaAvatar size="md" mood="celebrating" />
                  <div>
                    <CardTitle className="text-lg">Emma</CardTitle>
                    <p className="text-sm text-calm-700">Your Planning Assistant</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[500px]">
                <PlannerChatInterface
                  onStepComplete={(step, data) => {
                    console.log('Step completed:', step, data);
                  }}
                  currentStep="help"
                  context={{ isHelpPage: true }}
                  className="h-full border-none"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-calm-500" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
                  <h3 className="font-medium text-calm-900 mb-2">Need Assistance?</h3>
                  <p className="text-sm text-calm-700 mb-3">
                    Emma, your AI planning assistant, can help answer questions and guide you through the platform.
                  </p>
                  <Button 
                    onClick={() => setShowEmma(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Emma
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Popular Topics</h3>
                  <ul className="space-y-1">
                    <li>
                      <Button variant="ghost" className="w-full justify-start text-left">
                        How to add executors
                      </Button>
                    </li>
                    <li>
                      <Button variant="ghost" className="w-full justify-start text-left">
                        Uploading documents securely
                      </Button>
                    </li>
                    <li>
                      <Button variant="ghost" className="w-full justify-start text-left">
                        Creating a will
                      </Button>
                    </li>
                    <li>
                      <Button variant="ghost" className="w-full justify-start text-left">
                        Managing digital assets
                      </Button>
                    </li>
                    <li>
                      <Button variant="ghost" className="w-full justify-start text-left">
                        Privacy and security
                      </Button>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}