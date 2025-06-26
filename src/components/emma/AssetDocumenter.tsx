import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FolderClosed, Plus, Trash2, CreditCard, Home, Laptop, Briefcase, DollarSign } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';

interface Asset {
  id: string;
  type: 'financial' | 'physical' | 'digital' | 'business' | 'other';
  name: string;
  description: string;
  location: string;
  accountNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactOrganization: string;
}

interface AssetDocumenterProps {
  onComplete: (assetsData: any) => void;
  onBack?: () => void;
}

export default function AssetDocumenter({ onComplete, onBack }: AssetDocumenterProps) {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      type: 'financial',
      name: '',
      description: '',
      location: '',
      accountNumber: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactOrganization: ''
    }
  ]);
  const [activeAssetId, setActiveAssetId] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'financial' | 'physical' | 'digital' | 'business' | 'other'>('financial');

  const addAsset = (type: Asset['type']) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      type,
      name: '',
      description: '',
      location: '',
      accountNumber: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactOrganization: ''
    };
    setAssets([...assets, newAsset]);
    setActiveAssetId(newAsset.id);
    setActiveTab(type);
  };

  const removeAsset = (id: string) => {
    const newAssets = assets.filter(asset => asset.id !== id);
    setAssets(newAssets);
    if (activeAssetId === id && newAssets.length > 0) {
      setActiveAssetId(newAssets[0].id);
      setActiveTab(newAssets[0].type);
    }
  };

  const updateAsset = (id: string, field: keyof Asset, value: string) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const handleComplete = () => {
    const validAssets = assets.filter(asset => asset.name.trim());
    
    onComplete({
      assets: validAssets,
      completedAt: new Date().toISOString()
    });
  };

  const activeAsset = assets.find(asset => asset.id === activeAssetId) || assets[0];
  const isValid = assets.some(asset => asset.name.trim());

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'physical':
        return <Home className="h-5 w-5 text-blue-500" />;
      case 'digital':
        return <Laptop className="h-5 w-5 text-purple-500" />;
      case 'business':
        return <Briefcase className="h-5 w-5 text-amber-500" />;
      default:
        return <FolderClosed className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAssetTypeLabel = (type: Asset['type']) => {
    switch (type) {
      case 'financial':
        return 'Financial Asset';
      case 'physical':
        return 'Physical Asset';
      case 'digital':
        return 'Digital Asset';
      case 'business':
        return 'Business Asset';
      default:
        return 'Other Asset';
    }
  };

  const getAssetPlaceholder = (type: Asset['type']) => {
    switch (type) {
      case 'financial':
        return 'e.g., Checking Account, 401(k), Life Insurance';
      case 'physical':
        return 'e.g., Home, Car, Valuable Collection';
      case 'digital':
        return 'e.g., Cryptocurrency, Domain Names, Digital Media';
      case 'business':
        return 'e.g., Business Ownership, Partnership Stake';
      default:
        return 'e.g., Other Valuable Asset';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EmmaAvatar size="lg" mood="celebrating" />
        <div>
          <h2 className="text-2xl font-bold">Personal notes: WRITTEN! 🔥</h2>
          <p className="text-gray-600">
            Now let's make sure they can find everything you've worked so hard for - time to document your assets! 
            This is like creating a treasure map for your family.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderClosed className="h-5 w-5 text-calm-500" />
            Document Your Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
                <h3 className="font-medium text-calm-900 mb-2">Let's start with the BIG STUFF first:</h3>
                <div className="space-y-2">
                  <Button 
                    variant={activeTab === 'financial' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('financial')}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financial Assets
                  </Button>
                  <Button 
                    variant={activeTab === 'physical' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('physical')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Physical Assets
                  </Button>
                  <Button 
                    variant={activeTab === 'digital' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('digital')}
                  >
                    <Laptop className="h-4 w-4 mr-2" />
                    Digital Assets
                  </Button>
                  <Button 
                    variant={activeTab === 'business' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('business')}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Business Assets
                  </Button>
                  <Button 
                    variant={activeTab === 'other' ? 'default' : 'outline'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('other')}
                  >
                    <FolderClosed className="h-4 w-4 mr-2" />
                    Other Assets
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm">Your Asset List</h3>
                {assets.filter(asset => asset.type === activeTab).map(asset => (
                  <div 
                    key={asset.id}
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                      asset.id === activeAssetId 
                        ? 'bg-calm-100 border border-calm-300' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveAssetId(asset.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getAssetIcon(asset.type)}
                      <div>
                        <p className="font-medium truncate">
                          {asset.name || 'Unnamed Asset'}
                        </p>
                        {asset.description && (
                          <p className="text-xs text-gray-500 truncate">{asset.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAsset(asset.id);
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
                  onClick={() => addAsset(activeTab)}
                >
                  <Plus className="h-4 w-4" />
                  Add {getAssetTypeLabel(activeTab)}
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              {activeAsset && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    {getAssetIcon(activeAsset.type)}
                    <h3 className="font-medium">{getAssetTypeLabel(activeAsset.type)} Details</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Asset Name *</label>
                      <Input
                        value={activeAsset.name}
                        onChange={(e) => updateAsset(activeAsset.id, 'name', e.target.value)}
                        placeholder={getAssetPlaceholder(activeAsset.type)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Input
                        value={activeAsset.description}
                        onChange={(e) => updateAsset(activeAsset.id, 'description', e.target.value)}
                        placeholder="Brief description of this asset"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <Input
                          value={activeAsset.location}
                          onChange={(e) => updateAsset(activeAsset.id, 'location', e.target.value)}
                          placeholder="Where this asset is located or stored"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Account Number</label>
                        <Input
                          value={activeAsset.accountNumber}
                          onChange={(e) => updateAsset(activeAsset.id, 'accountNumber', e.target.value)}
                          placeholder="Account or reference number if applicable"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Contact Name</label>
                          <Input
                            value={activeAsset.contactName}
                            onChange={(e) => updateAsset(activeAsset.id, 'contactName', e.target.value)}
                            placeholder="Person to contact about this asset"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Organization</label>
                          <Input
                            value={activeAsset.contactOrganization}
                            onChange={(e) => updateAsset(activeAsset.id, 'contactOrganization', e.target.value)}
                            placeholder="Company or organization name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <Input
                            type="email"
                            value={activeAsset.contactEmail}
                            onChange={(e) => updateAsset(activeAsset.id, 'contactEmail', e.target.value)}
                            placeholder="Contact email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <Input
                            type="tel"
                            value={activeAsset.contactPhone}
                            onChange={(e) => updateAsset(activeAsset.id, 'contactPhone', e.target.value)}
                            placeholder="Contact phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-900 mb-2">💡 Emma's Asset Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific with asset names so they're easy to identify</li>
                  <li>• Include account numbers where applicable for faster access</li>
                  <li>• Add contact information for the person who manages each asset</li>
                  <li>• For physical items, be clear about their location</li>
                  <li>• Don't worry about getting everything perfect - you can always update later!</li>
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
              🎉 Assets Documented - Keep Going!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}