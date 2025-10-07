import { supabase } from './supabase';

// Base URL of the backend API (NestJS)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Story {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface StoryNode {
  id: string;
  storyId: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  choices?: Choice[];
}

export interface Choice {
  id: string;
  nodeId: string;
  text: string;
  nextNodeId: string;
}

export interface StoryProgress {
  storyId: string;
  currentNodeId?: string;
  choicesCount?: number;
  updatedAt?: string;
}

async function getAuthHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Utilisateur non authentifié');
  return { Authorization: `Bearer ${token}` } as const;
}

export const StoryService = {
  async getStories(): Promise<Story[]> {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/stories`, {
        headers: { ...headers },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Backend returns: id, title, description, imageUrl?, audioUrl?
      return data as Story[];
    } catch (error) {
      console.error('Erreur lors de la récupération des histoires (API):', error);
      return [];
    }
  },

  // Optionnel: récupérer la progression spécifique d'une histoire
  async getStoryProgress(_userId: string, storyId: string): Promise<StoryProgress | null> {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/stories/player/progress`, {
        headers: { ...headers },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Array<{
        storyId: string; currentNodeId?: string; choicesCount?: number; updatedAt?: string;
      }>;
      const prog = data.find((p) => p.storyId === storyId);
      return prog ? {
        storyId: prog.storyId,
        currentNodeId: prog.currentNodeId,
        choicesCount: prog.choicesCount,
        updatedAt: prog.updatedAt,
      } : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression (API):', error);
      return null;
    }
  },

  async getAllUserProgress(_userId: string): Promise<StoryProgress[]> {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/stories/player/progress`, {
        headers: { ...headers },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Array<{
        storyId: string; currentNodeId?: string; choicesCount?: number; updatedAt?: string;
      }>;
      return data.map((p) => ({
        storyId: p.storyId,
        currentNodeId: p.currentNodeId,
        choicesCount: p.choicesCount,
        updatedAt: p.updatedAt,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des progressions (API):', error);
      return [];
    }
  },

  // Admin: full story with nodes/choices
  async getStoryById(id: string): Promise<(Story & { nodes: StoryNode[] }) | null> {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/stories/${id}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Story & { nodes: StoryNode[] };
    } catch (e) {
      console.error('Erreur getStoryById:', e);
      return null;
    }
  },

  async createStory(payload: { title: string; description: string; imageUrl?: string; audioUrl?: string; firstNode?: string; }): Promise<Story> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Story;
  },

  async updateStory(id: string, payload: Partial<{ title: string; description: string; imageUrl?: string; audioUrl?: string; firstNode: string; }>): Promise<Story> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Story;
  },

  async deleteStory(id: string): Promise<void> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/${id}`, {
      method: 'DELETE', headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  async createNode(storyId: string, payload: { content: string; imageUrl?: string; audioUrl?: string; }): Promise<StoryNode> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/${storyId}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as StoryNode;
  },

  async updateNode(nodeId: string, payload: Partial<{ content: string; imageUrl?: string; audioUrl?: string; }>): Promise<StoryNode> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as StoryNode;
  },

  async deleteNode(nodeId: string): Promise<void> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/nodes/${nodeId}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },

  async createChoice(nodeId: string, payload: { text: string; nextNodeId: string; }): Promise<Choice> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/nodes/${nodeId}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Choice;
  },

  async updateChoice(choiceId: string, payload: Partial<{ text: string; nextNodeId: string; }>): Promise<Choice> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/choices/${choiceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Choice;
  },

  async deleteChoice(choiceId: string): Promise<void> {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/stories/choices/${choiceId}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};
