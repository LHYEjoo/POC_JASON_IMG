import * as React from 'react';
import { cn } from '../utils/cn';

interface Props {
  name: string;
  location: string;
  flag: string;
  onReset: () => void;
}

export function HeaderBar({ name, location, flag, onReset }: Props) {
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
          aria-label="Reset"
          onClick={onReset}
          className="rounded-[16px] px-4 py-2 bg-white/20 hover:bg-white/30 text-base shadow-vpro focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          ↻ Reset
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;

