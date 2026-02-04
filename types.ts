export enum Sender {
  User = 'user',
  Model = 'model',
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  image?: string; // Base64 string
  timestamp: number;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
}
