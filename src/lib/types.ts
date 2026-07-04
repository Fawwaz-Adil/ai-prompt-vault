export interface Prompt {
  id: string;
  title: string;
  body: string;
  tags: string[];
  folderId: string | null;
  favorite: boolean;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export type SortMode = 'recent' | 'alpha' | 'used';

export interface Settings {
  sort: SortMode;
}
