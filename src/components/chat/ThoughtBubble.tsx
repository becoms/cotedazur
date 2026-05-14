import { PropsWithChildren } from 'react';
export const ThoughtBubble = ({ onSelect, containerClass, children }: PropsWithChildren<{ containerClass?: string, onSelect: () => void }>) => {
  return (
    <button
      className={'my-1 bg-gray-700 border rounded-3xl py-1 px-3 relative w-fit cursor-pointer group hover:bg-gray-500 ' + containerClass}
      onClick={onSelect}
      onKeyUp={onSelect}
    >
      <div className="flex items-center gap-x-1"><span className="whitespace-normal text-xs text-white">{ children }</span></div>
      <div className="absolute -left-6 top-0 size-2 rounded-full border bg-transparent group-hover:bg-gray-500"></div>
      <div className="absolute -left-3.5 top-0 size-3 rounded-full border bg-transparent group-hover:bg-gray-500"></div>
    </button>
  );
};