import { MessageCircle, Heart, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmmaAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  mood?: 'default' | 'celebrating' | 'encouraging';
  className?: string;
}

export default function EmmaAvatar({ size = 'md', mood = 'default', className }: EmmaAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const moodColors = {
    default: 'bg-gradient-to-br from-calm-400 to-calm-600',
    celebrating: 'bg-gradient-to-br from-green-400 to-green-600',
    encouraging: 'bg-gradient-to-br from-amber-400 to-amber-600'
  };

  const MoodIcon = mood === 'celebrating' ? CheckCircle : mood === 'encouraging' ? Heart : MessageCircle;

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center text-white shadow-lg',
      sizeClasses[size],
      moodColors[mood],
      className
    )}>
      <MoodIcon className={cn(
        size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
      )} />
    </div>
  );
}