export interface Stream {
  _id: string;
  streamId: string;
  streamer: {
    id: string;
    username: string;
  };
  title: string;
  description?: string;
  isLive: boolean;
  viewersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StartStreamRequest {
  title: string;
  description?: string;
}

export interface StartStreamResponse {
  token: string;
  stream: Stream;
}
