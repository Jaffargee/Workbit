
import React from 'react';
import { Instagram, Twitter, Facebook, PlayCircle, Radio, Youtube } from 'lucide-react';
import { Jobs, NigerianState, Platform, Status } from './types/types';

export const PLATFORMS: { name: Platform; icon: React.ReactNode; color: string }[] = [
      { name: 'Instagram', icon: <Instagram size={24} />, color: 'bg-pink-500' },
      { name: 'TikTok', icon: <Radio size={30} />, color: 'bg-slate-900' },
      { name: 'Twitter (X)', icon: <Twitter size={24} />, color: 'bg-blue-400' },
      { name: 'Facebook', icon: <Facebook size={24} />, color: 'bg-blue-700' },
      { name: 'YouTube', icon: <PlayCircle size={24} />, color: 'bg-red-600' },
];

export const PLATFORMSXL: { name: Platform; icon: React.ReactNode; color: string }[] = [
      { name: 'Instagram', icon: <Instagram size={50} />, color: 'bg-pink-500' },
      { name: 'TikTok', icon: <Radio size={50} />, color: 'bg-slate-900' },
      { name: 'Twitter (X)', icon: <Twitter size={50} />, color: 'bg-blue-400' },
      { name: 'Facebook', icon: <Facebook size={50} />, color: 'bg-blue-700' },
      { name: 'YouTube', icon: <Youtube size={50} />, color: 'bg-red-600' },
];

export const MOCK_JOBS: Jobs[] = [
      {
            id: '1',
            creatorId: 'admin',
            title: 'Follow my Instagram Page',
            platform: 'Instagram',
            description: 'Help me grow my business page.',
            payoutPerTask: 20,
            workersNeeded: 500,
            workersCompleted: 342,
            instructions: '1. Click the link. 2. Follow @WorkbitOfficial. 3. Like the last 3 posts.',
            proofRequired: 'Screenshot of following profile.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'active'
      },
      {
            id: '2',
            creatorId: 'user123',
            title: 'Retweet pinned post',
            platform: 'Twitter (X)',
            description: 'Crypto project promotion.',
            payoutPerTask: 15,
            workersNeeded: 200,
            workersCompleted: 45,
            instructions: 'Go to my profile and retweet the pinned post about $WORKBIT.',
            proofRequired: 'Your X username.',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            status: 'active'
      },
      {
            id: '3',
            creatorId: 'admin',
            title: 'Watch & Like YouTube Short',
            platform: 'YouTube',
            description: 'Boosting engagement for a new tech review.',
            payoutPerTask: 25,
            workersNeeded: 1000,
            workersCompleted: 890,
            instructions: 'Watch the full short (60s), like, and leave a constructive comment.',
            proofRequired: 'Screenshot of liked video and comment.',
            createdAt: new Date(Date.now() - 100000).toISOString(),
            status: 'active'
      }
];

export const NigerianStates: NigerianState[] = [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 
      'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 
      'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 
      'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 
      'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
      'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
      'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 
      'Zamfara'
];

export const task = [
      { id: 'FOLLOW', name: 'Follow' },
      { id: 'LIKE', name: 'Like' },
      { id: 'RETWEET', name: 'Retweet' },
      { id: 'WATCH', name: 'Watch' },
      { id: 'COMMENT', name: 'Comment' },
      { id: 'SHARE', name: 'Share' },
      { id: 'SUBSCRIBE', name: 'Subscribe' },
      { id: 'OTHER', name: 'Other' },
];

export const status: {id: Status, name: string}[] = [
      { id: 'ACTIVE', name: 'Active' }, 
      { id: 'PENDING', name: 'Pending' }, 
      { id: 'DRAFT', name: 'Draft' },
      { id: 'PAUSED', name: 'Paused' },
      { id: 'COMPLETED', name: 'Completed' },
      { id: 'CANCELLED', name: 'Cancelled' },
];

export const SUBSCRIPTION_FEE = 5000;
export const REFERRAL_BONUS = 500;
export const SIDEBAR_ICON_SIZE = 20