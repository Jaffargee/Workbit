
import React from 'react';
import { Instagram, Twitter, Facebook, PlayCircle, Radio, Youtube } from 'lucide-react';
import { NigerianState, Platform, } from './types/types';

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

