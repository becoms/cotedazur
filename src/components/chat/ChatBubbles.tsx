import { ComponentPropsWithRef, PropsWithChildren } from 'react';
import { Bot, User } from 'lucide-react';

export const ChatBubble = ({ isBot, time, children, ref }: ComponentPropsWithRef<"div"> & PropsWithChildren<{ isBot: boolean; time: string }>) => {
  return (
    <div className={'flex flex-col gap-2.5 text-white ' + (isBot ? 'items-end' : 'items-start')}>
      { 
        isBot ? (
          <div className="flex h-10 min-w-10 items-center justify-center rounded-full">
            <Bot className="h-7 w-9" />
          </div>
        ) : (
          <div className="flex h-10 min-w-10 items-center justify-center rounded-full">
            <User className="h-7 w-9" />
          </div>
        )
      }
      <div className={'flex flex-col border-gray-200 bg-gray-100 p-4 ' + (isBot ? 'rounded-l-xl rounded-br-xl items-end' : 'rounded-r-xl rounded-bl-xl items-start')}>
        <div className={'flex items-center space-x-2 ' + (isBot ? 'rtl:space-x-reverse' : '') }>
          <span className="text-sm font-semibold text-gray-900">{ isBot ? 'EnerBot' : 'You' }</span>
          <span className="text-sm font-normal text-gray-500">{ time }</span>
        </div>
        <div className="w-full whitespace-normal py-2.5 text-sm font-normal text-gray-900" ref={ref}>{children}</div>
      </div>
    </div>
  );
};
