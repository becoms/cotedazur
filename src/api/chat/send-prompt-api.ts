import { ChatMessageType } from '@/types/chat-types';

export const sendPromptToApi = async (
  msg: string,
  updatedMessages: ChatMessageType[],
  setMessages: (messages: ChatMessageType[]) => void,
  setError: (error: string) => void,
  handleError: (response: Response) => Promise<string>,
) => {
  // Remove the bot invite message, as llm wants a user message 1st
  const sanitizedMessages = updatedMessages.slice(1);

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, messagesWithHistory(msg, sanitizedMessages));

  if (response.ok) {
    const botResponse = await response.json() as string;
    const updatedMessages2: ChatMessageType[] = [
      ...updatedMessages.map((m) => ({ ...m, botInProgress: false })),
      {
        text: botResponse,
        isBot: true,
        id: `${Math.random()}`,
        botInProgress: false,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
    ];
    setMessages(updatedMessages2);
  } else {
    const errorMsg = await handleError(response);
    console.error(errorMsg);
    setError(errorMsg);
  }
};

const messagesWithHistory = (msg: string, sanitizedMessages: ChatMessageType[]) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: msg,
    chat_history: sanitizedMessages.map((m) => m.text)
  })
});
