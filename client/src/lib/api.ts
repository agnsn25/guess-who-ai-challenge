import { apiRequest } from "./queryClient";

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  attributes: {
    gender: "male" | "female";
    hairColor: "black" | "brown" | "blonde" | "red" | "gray" | "white" | "other";
    hairLength: "short" | "medium" | "long" | "bald";
    eyeColor: "brown" | "blue" | "green" | "hazel" | "gray";
    hasGlasses: boolean;
    hasFacialHair: boolean;
    age: "young" | "middle-aged" | "elderly";
    skinTone: "light" | "medium" | "dark";
    hasHat: boolean;
    hasEarrings: boolean;
    expression: "smiling" | "serious" | "neutral";
  };
}

export interface Game {
  id: string;
  playerCharacterId?: string;
  aiCharacterId?: string;
  currentTurn: "player" | "ai";
  status: "active" | "won" | "lost" | "ai_won" | "draw";
  eliminatedCharacters: string[];
  turnCount: number;
  createdAt: string;
}

export interface GameHistoryEntry {
  id: string;
  gameId: string;
  type: "player_question" | "ai_question" | "player_response" | "ai_response";
  content: string;
  response?: string;
  timestamp: string;
}

export const gameApi = {
  // Get all characters
  async getCharacters(): Promise<Character[]> {
    const response = await apiRequest("GET", "/api/characters");
    return response.json();
  },

  // Create new game
  async createGame(playerCharacterId?: string, aiCharacterId?: string): Promise<Game> {
    const response = await apiRequest("POST", "/api/games", {
      playerCharacterId,
      aiCharacterId,
      currentTurn: "player",
      status: "active",
      eliminatedCharacters: [],
      turnCount: 1,
    });
    return response.json();
  },

  // Get game by ID
  async getGame(gameId: string): Promise<Game> {
    const response = await apiRequest("GET", `/api/games/${gameId}`);
    return response.json();
  },

  // Ask AI a question
  async askAI(gameId: string, question: string): Promise<{ answer: "yes" | "no"; reasoning: string }> {
    const response = await apiRequest("POST", `/api/games/${gameId}/ask-ai`, { question });
    return response.json();
  },

  // Get AI's question
  async getAIQuestion(gameId: string): Promise<{ question: string; reasoning: string }> {
    const response = await apiRequest("POST", `/api/games/${gameId}/ai-question`);
    return response.json();
  },

  // Respond to AI's question
  async respondToAI(gameId: string, response: "yes" | "no"): Promise<{ success: boolean }> {
    const result = await apiRequest("POST", `/api/games/${gameId}/respond`, { response });
    return result.json();
  },

  // Eliminate characters
  async eliminateCharacters(gameId: string, characterIds: string[]): Promise<{ eliminatedCharacters: string[] }> {
    const response = await apiRequest("POST", `/api/games/${gameId}/eliminate`, { characterIds });
    return response.json();
  },

  // Make final guess
  async makeGuess(gameId: string, characterId: string): Promise<{ correct: boolean; aiCharacterId: string; status: string }> {
    const response = await apiRequest("POST", `/api/games/${gameId}/guess`, { characterId });
    return response.json();
  },

  // Get game history
  async getGameHistory(gameId: string): Promise<GameHistoryEntry[]> {
    const response = await apiRequest("GET", `/api/games/${gameId}/history`);
    return response.json();
  },

  // AI makes final guess
  async makeAIGuess(gameId: string): Promise<{ 
    correct: boolean; 
    guessedCharacterId: string; 
    characterName: string; 
    reasoning: string; 
    status: string;
  }> {
    const response = await apiRequest("POST", `/api/games/${gameId}/ai-guess`);
    return response.json();
  },
};
