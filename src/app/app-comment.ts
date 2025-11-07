export interface AppComment {
  id?: number;
  content: string;
  timestamp?: string;
  // UI-only fields
  isEditing?: boolean;
  editContent?: string;
}
