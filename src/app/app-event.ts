import { AppComment } from "./app-comment";

export interface AppEvent {
  id?: number;
  title: string;
  description?: string;
  startDate?: string;     // 🆕
  endDate?: string;
  
  image?: File;
  imagePath?: string;
  timestamp?: string;
  name?: string;
  newComment?: string; // ← add this to fix the error
  comments?: AppComment[]; // optional, if you preload comments with the event
  video?: File;      // <-- add this
  videoPath?: string;
  groupId?: number;
}
