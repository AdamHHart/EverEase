import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { FolderClosed, DollarSign, Home, Laptop, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';

interface Asset {
  id: string;
  type: string;
  name: string;
  description: string;
  location: string;
  accountNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactOrganization: string;
}

interface AssetReviewProps {
  assets: Asset[];
  plannerName: string;
  onComplete: () => void;
  onBack?: () => void;
}

export default function AssetReview({ assets, plannerName, onComplete, onBack }: AssetReviewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  const toggleAssetExpanded = (assetId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
  };

  const getAssetIcon = (type: string) => {
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

  const filteredAssets = activeCategory === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === activeCategory);

  const assetCategories = ['all', ...new Set(assets.map(asset => asset.type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <EmmaAvatar size="md" mood="encouraging" />
        <div>
          <h2 className="text-xl font-bold">Asset Overview</h2>
          <p className="text-gray-600">
            Here are the assets that {plannerName} has documented for you to manage.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderClosed className="h-5 w-5 text-blue-500" />
            {plannerName}'s Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {assetCategories.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Assets' : `${category} Assets`}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAssets.length > 0 ? (
              filteredAssets.map(asset => (
                <div 
                  key={asset.id} 
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleAssetExpanded(asset.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getAssetIcon(asset.type)}
                      <div>
                        <h3 className="font-medium">{asset.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{asset.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedAssets.has(asset.id) ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </div>
                  
                  {expandedAssets.has(asset.id) && (
                    <div className="p-4 border-t">
                      {asset.description && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium">Description</h4>
                          <p className="text-sm text-gray-600">{asset.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {asset.location && (
                          <div>
                            <h4 className="text-sm font-medium">Location</h4>
                            <p className="text-sm text-gray-600">{asset.location}</p>
                          </div>
                        )}
                        
                        {asset.accountNumber && (
                          <div>
                            <h4 className="text-sm font-medium">Account Number</h4>
                            <p className="text-sm text-gray-600">{asset.accountNumber}</p>
                          </div>
                        )}
                      </div>
                      
                      {(asset.contactName || asset.contactOrganization) && (
                        <div className="border-t pt-3 mt-3">
                          <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {asset.contactName && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500">Name</h5>
                                <p className="text-sm">{asset.contactName}</p>
                              </div>
                            )}
                            
                            {asset.contactOrganization && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500">Organization</h5>
                                <p className="text-sm">{asset.contactOrganization}</p>
                              </div>
                            )}
                            
                            {asset.contactEmail && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500">Email</h5>
                                <p className="text-sm">{asset.contactEmail}</p>
                              </div>
                            )}
                            
                            {asset.contactPhone && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500">Phone</h5>
                                <p className="text-sm">{asset.contactPhone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderClosed className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
                <p className="text-gray-500">
                  {activeCategory === 'all' 
                    ? `${plannerName} hasn't documented any assets yet.` 
                    : `No ${activeCategory} assets have been documented.`}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Next Steps
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Now that you've reviewed the assets, you may need to:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Contact the financial institutions listed to notify them of the death</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Gather any physical assets and secure them</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Begin the process of transferring or distributing assets according to the will</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button 
              onClick={onComplete}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Continue to Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}