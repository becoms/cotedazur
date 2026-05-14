import { ChangeEvent, KeyboardEvent, createRef, useRef, useState } from 'react';
import { TargetValueEvent } from "../../types/chat-types";
import { ThoughtBubble } from "./ThoughtBubble";
import { Send } from 'lucide-react';

export const ChatPrompt = ({ showExamples = false, onSend }: { showExamples: boolean, onSend: (m: string) => void }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [promptPopupArobaseIndex, setPromptPopupArobaseIndex] = useState<number | undefined>();

  const inputRef = createRef<HTMLTextAreaElement>();
  const divPlaceholderRef = createRef<HTMLDivElement>();

  const onSubmit = () => { 
    setPromptPopupArobaseIndex(undefined);
    onSend(prompt);
    setPrompt('');
  };
  
  const onPopupClose = (e: KeyboardEvent<HTMLElement> | undefined) => {
    setPromptPopupArobaseIndex(undefined);
    inputRef.current?.focus();

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onPromptChange = (event: ChangeEvent<HTMLTextAreaElement> & TargetValueEvent) => {   
    setPrompt((event.target as HTMLInputElement).value);
  };
  
  const blockSubmit = useRef<boolean>(false);

  const onPromptKeyup = (event: KeyboardEvent<HTMLTextAreaElement> & TargetValueEvent) => {
    if (event.key === 'Escape') {
      onPopupClose(event);
    }

    if (event.key === 'Enter') {
      if (blockSubmit.current === true) { // Block the event if enter has been pressed to select option in prompt popup 
        blockSubmit.current = false;
        event.preventDefault();
      } else {
        onSubmit();
      }
    }
  };

  const [promptPopupFocus, setPromptPopupFocus] = useState<boolean>(false);
  const onPromptKeydown = (event: KeyboardEvent<HTMLTextAreaElement> & TargetValueEvent) => {
    if (event.key === 'Tab' && promptPopupArobaseIndex !== undefined) {
      setPromptPopupFocus(!promptPopupFocus);
      event.preventDefault();
    }
  };

  const examples = [
    `For appellation: @ML23108X12 with group: @SY226, which features is the most impactful regarding consumption?`,
  ];

  return (
    <section className="relative flex flex-col gap-y-2">
      <section className="flex max-w-full gap-x-3 truncate">
        <div className="max-w-full flex-1 truncate">
          <textarea
            ref={inputRef}
            placeholder="Type @ to find options"
            tabIndex={0}
            value={prompt}
            className="block w-full max-w-full overflow-auto rounded-md border-0 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm sm:leading-6"
            onChange={ (event) => onPromptChange(event as unknown as never) }
            onKeyUp={ (event) => onPromptKeyup(event as unknown as never) }
            onKeyDown={ (event) => onPromptKeydown(event as unknown as never) }
          />
          { /* following div is used to compute text width to place popup correctly */ }
          <div ref={divPlaceholderRef} className="ml-2 h-0 w-fit truncate">{prompt}</div> 
        </div>


        <button onClick={ () => onSubmit() } disabled={!prompt} className="bg-medium1 focus:outline-1">
          <Send className="text-white size-5" />
        </button>
      </section>
      <section className="flex w-full flex-col">
      {
        showExamples && (
          examples?.map((example, i) => (
              <ThoughtBubble
                key={example}
                onSelect={() => setPrompt(example.replace('@', ''))}
                containerClass={ 'max-w-[60%] ' + ((i%2 === 1) ? 'self-end' : 'ml-10')}
              >
                { example }
              </ThoughtBubble>
            )
          )
        )
      }
      </section>
    </section>
  );
};
