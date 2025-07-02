import { CheckBadgeIcon, ChatBubbleLeftRightIcon, FireIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/solid';

const BADGE_CONFIG = {
  first_answer: { label: 'First Answer', icon: CheckBadgeIcon, color: 'text-green-500' },
  helper: { label: 'Helper', icon: ChatBubbleLeftRightIcon, color: 'text-blue-500' },
  popular: { label: 'Popular', icon: FireIcon, color: 'text-orange-500' },
  rising_star: { label: 'Rising Star', icon: StarIcon, color: 'text-yellow-500' },
  top_3: { label: 'Top 3', icon: TrophyIcon, color: 'text-purple-500' },
};

export default function Badge({ badgeKey }) {
  const badge = BADGE_CONFIG[badgeKey];
  if (!badge) return null;
  const Icon = badge.icon;
  return (
    <div className="flex items-center space-x-1" title={badge.label}>
      <Icon className={`w-5 h-5 ${badge.color}`} />
      <span className="text-xs">{badge.label}</span>
    </div>
  );
} 