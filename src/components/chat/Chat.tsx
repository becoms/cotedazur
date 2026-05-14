import { ChatBubble } from "./ChatBubbles";
import { X } from 'lucide-react';
import { useRef, useState } from "react";
import { ChatPrompt } from "./ChatPrompt";
import { ChatMessageType, toStringObjectGuard } from '../../types/chat-types';
import { getTime, handleError } from "../../utils/chat.utility";
import ReactMarkdown from "react-markdown";
import { sendPromptToApi } from "@/api/chat/send-prompt-api";

export const Chat = ({ isOpen, handleClose }: { isOpen: boolean; handleClose: () => void }) => {
  const [messages, setMessages] = useState<Array<ChatMessageType>>([
    { id: '1', isBot: true, text: 'Hello! How can I help you today?', botInProgress: false, time: '12:00' },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const addPrompt = async (msg: string) => {
    const updatedMessages = [
      ...messages,
      {
        id: `${Math.random()}`,
        isBot: false,
        text: msg,
        botInProgress: true,
        time: getTime(new Date()),
      }
    ];
    setMessages(updatedMessages);
    promptRef.current?.scrollIntoView(true);
    setTimeout(() => containerRef.current?.scrollBy({ left: 0, top: 200, behavior: 'smooth' }), 200);

    setError(undefined);
    setLoading(true);

    // Remove the bot invite message, as llm wants a user message 1st
    const sanitizedMessages = messages.slice(1);

    // If there was a bot error, then user typed another text, we should remove the 1st prompt that causes the error
    // unless there will be 2 consecutive user messages which will not be valid for the llm
    for (let i = 0; i < sanitizedMessages.length - 1; i++) {
      if (!sanitizedMessages[i].isBot && !sanitizedMessages[i + 1].isBot) {
        sanitizedMessages[i] = sanitizedMessages[i + 1];
        break;
      }
    }

    try {
      await sendPromptToApi(msg, updatedMessages, setMessages, setError, handleError);
    } catch (err: unknown) {
      console.error(err);
      setError(toStringObjectGuard(err) ? err.toString() : 'unknown error');
    } finally {
      setLoading(false);
      promptRef.current?.scrollIntoView(true);
      setTimeout(() => containerRef.current?.scrollBy({ left: 0, top: 200, behavior: 'smooth' }), 200);
      setTimeout(() => containerRef.current?.scrollBy({ left: 0, top: 200, behavior: 'smooth' }), 1000);
    }
  };


  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="relative z-50 max-h-full w-1/3 overflow-y-hidden p-4 shadow-xl flex flex-col">
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 opacity-40" />
        <div className="absolute top-0 left-0 p-2">
          <header className="flex justify-end items-center">
            <button>
              <X className="text-white" />
            </button>
          </header>

          <div className="flex h-full max-h-full overflow-y-hidden">
            <section className="flex max-h-full min-h-full w-full flex-col gap-4 overflow-y-hidden px-1.5 py-4">
              <section ref={containerRef} className="flex size-full max-h-full flex-col overflow-y-auto overflow-x-hidden pr-4">
                <section className="flex flex-1 flex-col gap-y-8">
                  {
                    messages.map((message) => (
                      <ChatBubble key={message.id} isBot={message.isBot} time={message.time}>
                        {
                          message.isBot ? (
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                          ) : (
                            <>{message.text}</>
                          )
                        }
                      </ChatBubble>
                    ))
                  }
                  {
                    loading && (
                      <ChatBubble isBot={true} time={getTime(new Date())}>
                        <div className='flex w-fit items-center justify-center space-x-2'>
                          <div className='size-3 animate-bounce rounded-full bg-medium1 [animation-delay:-0.3s]'></div>
                          <div className='size-3 animate-bounce rounded-full bg-medium1 [animation-delay:-0.15s]'></div>
                          <div className='size-3 animate-bounce rounded-full bg-medium1'></div>
                        </div>
                      </ChatBubble>
                    )
                  }
                  {
                    error && (
                      <div className="w-fit rounded-md bg-red-600 p-3 text-center text-sm font-semibold text-gray-200">{error}</div>
                    )
                  }
                </section>
                <section ref={promptRef} className="my-8 flex-none">
                  <ChatPrompt showExamples={messages.length === 1} onSend={addPrompt}></ChatPrompt>
                </section>
              </section>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};