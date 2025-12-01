import * as React from 'react';

export default function Toast({ message, type }: { message: string; type?: 'info' | 'error' }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 inset-x-0 flex justify-center z-20">
      <div className={`rounded-[16px] px-4 py-2 shadow-vpro text-white ${type === 'error' ? 'bg-accent' : 'bg-primary'}`}>
        {message}
      </div>
    </div>
  );
}

