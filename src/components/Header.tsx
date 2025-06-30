import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Menu, User, Bell, ChevronDown, LogOut, MessageCircle, CreditCard } from 'lucide-react';
import { cn, getInitials, generateAvatarColor } from '../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import EmmaAvatar from './emma/EmmaAvatar';
import { supabase } from '../lib/supabase';

export default function Header() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .maybeSingle();
      
      if (error) throw error;
      
      setHasSubscription(data?.subscription_status === 'active' || data?.subscription_status === 'trialing');
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const toggleSidebar = () => {
    // For mobile devices, we would toggle sidebar visibility
    // This is a placeholder for actual implementation
    console.log('Toggle sidebar');
  };

  const toggleEmmaChat = () => {
    // Dispatch a custom event that EmmaFloatingAssistant will listen for
    window.dispatchEvent(new CustomEvent('toggleEmmaChat'));
  };
  
  return (
    <header className="bg-white border-b border-border py-2 px-4 flex items-center justify-between">
      {/* Mobile menu button */}
      <button 
        className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <div className="flex-1 md:pl-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-foreground">My Secure Vault</h2>
          <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="ml-2 md:hidden">
            <img 
              src="/black_circle_360x360.png" 
              alt="Powered by Bolt.new" 
              className="h-6 w-auto"
            />
          </a>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Chat with Emma button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden md:flex items-center gap-2"
          onClick={toggleEmmaChat}
        >
          <EmmaAvatar size="sm" mood="celebrating" />
          <span>Chat with Emma</span>
        </Button>
        
        {/* Upgrade/Membership button */}
        {!loading && (
          <Button 
            variant={hasSubscription ? "outline" : "calm"}
            size="sm" 
            className="hidden md:flex items-center gap-2"
            onClick={() => navigate('/payment')}
          >
            <CreditCard className="h-4 w-4" />
            <span>{hasSubscription ? 'Membership Active' : 'Upgrade'}</span>
          </Button>
        )}
        
        {/* Notifications */}
        <button className="p-2 rounded-full text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
        </button>
        
        {/* User menu */}
        <div className="relative">
          <button
            className="flex items-center space-x-2"
            onClick={toggleDropdown}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-white",
              generateAvatarColor(user?.email || '')
            )}>
              <span className="text-sm font-medium">
                {getInitials(user?.email?.split('@')[0] || '')}
              </span>
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={closeDropdown}
              ></div>
              <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-20 border border-border">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    closeDropdown();
                    navigate('/profile');
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </button>
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    closeDropdown();
                    toggleEmmaChat();
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat with Emma
                </button>
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    closeDropdown();
                    navigate('/payment');
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {hasSubscription ? 'Manage Membership' : 'Upgrade to Premium'}
                </button>
                
                <button
                  onClick={signOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-error-500 hover:bg-muted"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}