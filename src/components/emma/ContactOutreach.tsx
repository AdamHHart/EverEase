import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Phone, Building, User, Edit, Send, CheckCircle, ArrowRight } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';
import { supabase } from '../../lib/supabase';
import { toast } from '../ui/toast';

interface Contact {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  type: string;
  category: string;
  status: 'not_contacted' | 'sent';
}

interface ContactOutreachProps {
  contacts: Contact[];
  plannerName: string;
  onComplete: () => void;
  onBack?: () => void;
}

export default function ContactOutreach({ contacts, plannerName, onComplete, onBack }: ContactOutreachProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [contactStatus, setContactStatus] = useState<Record<string, 'not_contacted' | 'sent'>>({});

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    
    // Generate email template
    const subject = `Notification of Passing - ${contact.organization || contact.category}`;
    const body = `Dear ${contact.name},

I am writing to inform you of the passing of ${plannerName}. As the designated executor of their estate, I need to notify you of this passing and request information about next steps regarding ${contact.category.toLowerCase()} matters.

Please let me know what documentation you require to proceed with the necessary account closures, transfers, or other required actions. I can provide a certified copy of the death certificate and any other documentation you may need.

I would appreciate your guidance on the next steps and any forms that need to be completed.

Thank you for your assistance during this difficult time.

Sincerely,
[Your Name]
Executor of the Estate`;

    setEmailContent({
      subject,
      body
    });
  };

  const handleSendEmail = async () => {
    if (!selectedContact) return;
    
    setSending(true);
    
    try {
      // In a real implementation, this would send an actual email
      // For this demo, we'll just simulate it
      
      // Update contact status
      setContactStatus({
        ...contactStatus,
        [selectedContact.id]: 'sent'
      });
      
      toast({
        title: "Email Sent",
        description: `Notification sent to ${selectedContact.name} at ${selectedContact.email}`,
      });
      
      // Reset selected contact
      setSelectedContact(null);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getContactsByCategory = () => {
    const categories: Record<string, Contact[]> = {};
    
    contacts.forEach(contact => {
      if (!categories[contact.category]) {
        categories[contact.category] = [];
      }
      categories[contact.category].push({
        ...contact,
        status: contactStatus[contact.id] || contact.status
      });
    });
    
    return categories;
  };

  const categorizedContacts = getContactsByCategory();
  const allContacted = contacts.every(contact => 
    (contactStatus[contact.id] || contact.status) === 'sent'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EmmaAvatar size="md" mood="encouraging" />
        <div>
          <h2 className="text-xl font-bold">Contact Representatives</h2>
          <p className="text-gray-600">
            Notify important organizations and representatives about {plannerName}'s passing.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Contact Outreach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(categorizedContacts).length > 0 ? (
            <>
              {Object.entries(categorizedContacts).map(([category, categoryContacts]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-medium capitalize">{category} Contacts</h3>
                  <div className="space-y-2">
                    {categoryContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-gray-500">{contact.organization || contact.type}</p>
                          </div>
                          <div>
                            {contact.status === 'sent' || contactStatus[contact.id] === 'sent' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3" />
                                Contacted
                              </span>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => handleSelectContact(contact)}
                              >
                                Contact
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                          {contact.email && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Contact Guidance
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  When contacting these organizations:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Have the death certificate ready to provide upon request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Ask about their specific process for handling accounts after death</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Request written confirmation of any actions taken</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Keep records of all communications for estate purposes</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No contacts found</h3>
              <p className="text-gray-500">
                {plannerName} hasn't added any contact information for organizations or representatives.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button 
              onClick={onComplete}
              disabled={!allContacted && contacts.length > 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {contacts.length === 0 ? 'Skip This Step' : 'Complete Contact Outreach'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Composition Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-medium">Contact {selectedContact.name}</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To:</label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{selectedContact.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject:</label>
                <Input
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message:</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[200px]"
                  value={emailContent.body}
                  onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedContact(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={sending}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}