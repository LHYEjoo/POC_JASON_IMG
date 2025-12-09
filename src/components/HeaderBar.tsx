import * as React from 'react';
import { cn } from '../utils/cn';

interface Props {
  name: string;
  location: string;
  flag: string;
  onSettingsClick: () => void;
}

export function HeaderBar({ name, location, flag, onSettingsClick }: Props) {
  return (
    <header className={cn('fixed inset-x-0 top-0 z-30 bg-[#00ABFE] text-white shadow-vpro')}> 
      <div className="mx-auto max-w-5xl px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img src="/img/jason.png" alt="Jason" className="h-14 w-14 rounded-full ring-2 ring-white/30" />
          <div className="leading-tight">
            <div className="text-3xl font-semibold">{name}</div>
            <div className="text-base opacity-90">{location} <span aria-hidden>🇭🇰</span></div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Instellingen"
          onClick={onSettingsClick}
          className="rounded-[16px] p-2.5 bg-white/20 hover:bg-white/30 shadow-vpro focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;

