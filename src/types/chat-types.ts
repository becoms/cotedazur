export type ChatMessageType = {
  id: string;
  isBot: boolean;
  text: string;
  time: string;
  botInProgress: boolean
};


export type TargetValueEvent = { target: HTMLInputElement };

export type ToStringObject = {
  toString: () => string;
};

export const toStringObjectGuard = (o: unknown): o is ToStringObject => {
  if (o && typeof (o as ToStringObject).toString === 'function') {
    return true;
  } else {
    return false;
  }
};
