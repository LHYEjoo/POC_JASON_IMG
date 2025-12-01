import * as React from 'react';

export default function TextInputFallback({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [val, setVal] = React.useState('');
  return (
    <form
      className="mt-6 flex items-center gap-2"
      onSubmit={(e) => { e.preventDefault(); if (val.trim()) { onSubmit(val.trim()); setVal(''); } }}
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Typ je vraag…"
        className="flex-1 rounded-[16px] border border-wolf bg-white px-4 py-3 shadow-vpro focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      />
      <button type="submit" className="rounded-[16px] px-4 py-3 bg-primary text-white shadow-vpro hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Stuur</button>
    </form>
  );
}

