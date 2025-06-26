import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FileText, Upload, Camera, Trash2, Plus, CheckCircle } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';
import DocumentScanner from '../DocumentScanner';

interface Document {
  id: string;
  category: 'legal' | 'financial' | 'medical' | 'property' | 'personal';
  name: string;
  description: string;
  file: File | null;
  scannedImage: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactOrganization: string;
}

interface DocumentOrganizerProps {
  onComplete: (documentsData: any) => void;
  onBack?: () => void;
}

export default function DocumentOrganizer({ onComplete, onBack }: DocumentOrganizerProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      category: 'legal',
      name: '',
      description: '',
      file: null,
      scannedImage: null,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactOrganization: ''
    }
  ]);
  const [activeDocId, setActiveDocId] = useState<string>('1');
  const [activeCategory, setActiveCategory] = useState<Document['category']>('legal');
  const [showScanner, setShowScanner] = useState(false);

  const addDocument = (category: Document['category']) => {
    const newDocument: Document = {
      id: Date.now().toString(),
      category,
      name: '',
      description: '',
      file: null,
      scannedImage: null,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactOrganization: ''
    };
    setDocuments([...documents, newDocument]);
    setActiveDocId(newDocument.id);
    setActiveCategory(category);
  };

  const removeDocument = (id: string) => {
    const newDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(newDocuments);
    if (activeDocId === id && newDocuments.length > 0) {
      setActiveDocId(newDocuments[0].id);
      setActiveCategory(newDocuments[0].category);
    }
  };

  const updateDocument = (id: string, field: keyof Document, value: any) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDocument(docId, 'file', file);
      updateDocument(docId, 'scannedImage', null);
    }
  };

  const handleCapture = (imageData: string) => {
    updateDocument(activeDocId, 'scannedImage', imageData);
    updateDocument(activeDocId, 'file', null);
    setShowScanner(false);
  };

  const handleComplete = () => {
    const validDocuments = documents.filter(doc => 
      doc.name.trim() && (doc.file || doc.scannedImage)
    );
    
    onComplete({
      documents: validDocuments,
      completedAt: new Date().toISOString()
    });
  };

  const activeDocument = documents.find(doc => doc.id === activeDocId) || documents[0];
  const isValid = documents.some(doc => doc.name.trim() && (doc.file || doc.scannedImage));

  const getCategoryIcon = (category: Document['category']) => {
    return <FileText className="h-5 w-5 text-calm-500" />;
  };

  const getCategoryLabel = (category: Document['category']) => {
    switch (category) {
      case 'legal':
        return 'Legal Document';
      case 'financial':
        return 'Financial Document';
      case 'medical':
        return 'Medical Document';
      case 'property':
        return 'Property Document';
      case 'personal':
        return 'Personal Document';
    }
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
            <h2 className="text-2xl font-bold">ASSETS: DOCUMENTED! 🔥</h2>
            <p className="text-gray-600">
              You are absolutely KILLING IT! I am so proud of how thorough you're being - your family is going to be amazed at how organized you are!
              Final step: Let's get all your important documents uploaded and organized. This is your victory lap! 🏆
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-calm-500" />
              Organize Your Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
                  <h3 className="font-medium text-calm-900 mb-2">Document Categories</h3>
                  <div className="space-y-2">
                    <Button 
                      variant={activeCategory === 'legal' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('legal')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Legal Documents
                    </Button>
                    <Button 
                      variant={activeCategory === 'financial' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('financial')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Financial Documents
                    </Button>
                    <Button 
                      variant={activeCategory === 'medical' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('medical')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Medical Documents
                    </Button>
                    <Button 
                      variant={activeCategory === 'property' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('property')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Property Documents
                    </Button>
                    <Button 
                      variant={activeCategory === 'personal' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                      onClick={() => setActiveCategory('personal')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Personal Documents
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Your Document List</h3>
                  {documents.filter(doc => doc.category === activeCategory).map(doc => (
                    <div 
                      key={doc.id}
                      className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                        doc.id === activeDocId 
                          ? 'bg-calm-100 border border-calm-300' 
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveDocId(doc.id)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-5 w-5 text-calm-500" />
                        <div>
                          <p className="font-medium truncate">
                            {doc.name || 'Unnamed Document'}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-gray-500 truncate">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(doc.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 flex items-center gap-2"
                    onClick={() => addDocument(activeCategory)}
                  >
                    <Plus className="h-4 w-4" />
                    Add {getCategoryLabel(activeCategory)}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                {activeDocument && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      {getCategoryIcon(activeDocument.category)}
                      <h3 className="font-medium">{getCategoryLabel(activeDocument.category)} Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Document Name *</label>
                        <Input
                          value={activeDocument.name}
                          onChange={(e) => updateDocument(activeDocument.id, 'name', e.target.value)}
                          placeholder="e.g., Will, Insurance Policy, Birth Certificate"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                          value={activeDocument.description}
                          onChange={(e) => updateDocument(activeDocument.id, 'description', e.target.value)}
                          placeholder="Brief description of this document"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Document File *</label>
                        {activeDocument.scannedImage ? (
                          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={activeDocument.scannedImage} 
                              alt="Scanned document" 
                              className="w-full h-full object-contain"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => updateDocument(activeDocument.id, 'scannedImage', null)}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : activeDocument.file ? (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-blue-500" />
                              <div>
                                <p className="font-medium">{activeDocument.file.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(activeDocument.file.size / 1024 / 1024).toFixed(2)}MB
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateDocument(activeDocument.id, 'file', null)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*,application/pdf,.doc,.docx"
                              onChange={(e) => handleFileChange(e, activeDocument.id)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={() => setShowScanner(true)}
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-3">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Contact Name</label>
                            <Input
                              value={activeDocument.contactName}
                              onChange={(e) => updateDocument(activeDocument.id, 'contactName', e.target.value)}
                              placeholder="Person to contact about this document"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Organization</label>
                            <Input
                              value={activeDocument.contactOrganization}
                              onChange={(e) => updateDocument(activeDocument.id, 'contactOrganization', e.target.value)}
                              placeholder="Company or organization name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                              type="email"
                              value={activeDocument.contactEmail}
                              onChange={(e) => updateDocument(activeDocument.id, 'contactEmail', e.target.value)}
                              placeholder="Contact email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <Input
                              type="tel"
                              value={activeDocument.contactPhone}
                              onChange={(e) => updateDocument(activeDocument.id, 'contactPhone', e.target.value)}
                              placeholder="Contact phone number"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-green-900 mb-2">🏆 You're in the Home Stretch!</h4>
                  <p className="text-sm text-green-800 mb-3">
                    You're doing amazing! These documents will be securely stored and only accessible to your executors when needed.
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Upload the most important documents first - will, insurance policies, property deeds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Add contact information so your executors know who to reach out to</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>You can always come back and add more documents later</span>
                    </li>
                  </ul>
                </div>
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
                🎉 Documents Organized - Complete Your Plan!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}