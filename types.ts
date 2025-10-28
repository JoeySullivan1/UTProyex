export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: User;
  participants: User[];
  files: ProjectFile[];
  comments: Comment[];
  originalityScore: number;
  originalityJustification: string;
  createdAt: string;
}

export enum Page {
  Auth,
  Home,
  Project,
  Upload,
  Profile,
}

export interface OriginalityResponse {
  score: number;
  justification: string;
}
