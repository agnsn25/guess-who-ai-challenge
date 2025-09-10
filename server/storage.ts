import { type Character, type InsertCharacter, type Game, type InsertGame, type GameHistoryEntry, type InsertGameHistory, type User, type InsertUser, type CharacterAttributes } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Character methods
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;

  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game>;

  // Game history methods
  addGameHistory(history: InsertGameHistory): Promise<GameHistoryEntry>;
  getGameHistory(gameId: string): Promise<GameHistoryEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private characters: Map<string, Character>;
  private games: Map<string, Game>;
  private gameHistory: Map<string, GameHistoryEntry[]>;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.games = new Map();
    this.gameHistory = new Map();
    this.initializeCharacters();
  }

  private initializeCharacters() {
    // Initialize 20 diverse characters with their attributes
    const characterData: Array<{ name: string; imageUrl: string; attributes: CharacterAttributes }> = [
      {
        name: "Sarah",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612d83c?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "brown",
          hairLength: "long",
          eyeColor: "blue",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: true,
          expression: "smiling"
        }
      },
      {
        name: "Michael",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "gray",
          hairLength: "short",
          eyeColor: "brown",
          hasGlasses: true,
          hasFacialHair: true,
          age: "middle-aged",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "serious"
        }
      },
      {
        name: "Lily",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "black",
          hairLength: "long",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "medium",
          hasHat: false,
          hasEarrings: false,
          expression: "neutral"
        }
      },
      {
        name: "Marcus",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "black",
          hairLength: "short",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "dark",
          hasHat: false,
          hasEarrings: false,
          expression: "smiling"
        }
      },
      {
        name: "Eleanor",
        imageUrl: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "gray",
          hairLength: "short",
          eyeColor: "blue",
          hasGlasses: false,
          hasFacialHair: false,
          age: "elderly",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "neutral"
        }
      },
      {
        name: "Tommy",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "red",
          hairLength: "short",
          eyeColor: "green",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "smiling"
        }
      },
      {
        name: "Zoe",
        imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "other",
          hairLength: "medium",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: true,
          expression: "serious"
        }
      },
      {
        name: "Bruno",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "black",
          hairLength: "bald",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: true,
          age: "middle-aged",
          skinTone: "medium",
          hasHat: false,
          hasEarrings: false,
          expression: "serious"
        }
      },
      {
        name: "Emma",
        imageUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "blonde",
          hairLength: "long",
          eyeColor: "green",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "smiling"
        }
      },
      {
        name: "Devon",
        imageUrl: "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "black",
          hairLength: "long",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "dark",
          hasHat: false,
          hasEarrings: false,
          expression: "smiling"
        }
      },
      {
        name: "Nova",
        imageUrl: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "other",
          hairLength: "short",
          eyeColor: "blue",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: true,
          expression: "neutral"
        }
      },
      {
        name: "Arthur",
        imageUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "white",
          hairLength: "medium",
          eyeColor: "blue",
          hasGlasses: false,
          hasFacialHair: true,
          age: "elderly",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "neutral"
        }
      },
      {
        name: "Rosa",
        imageUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "brown",
          hairLength: "medium",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "medium",
          hasHat: false,
          hasEarrings: true,
          expression: "smiling"
        }
      },
      {
        name: "Hassan",
        imageUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "black",
          hairLength: "medium",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: true,
          age: "young",
          skinTone: "medium",
          hasHat: false,
          hasEarrings: false,
          expression: "serious"
        }
      },
      {
        name: "Maya",
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "brown",
          hairLength: "short",
          eyeColor: "brown",
          hasGlasses: true,
          hasFacialHair: false,
          age: "middle-aged",
          skinTone: "medium",
          hasHat: false,
          hasEarrings: false,
          expression: "neutral"
        }
      },
      {
        name: "Alex",
        imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "brown",
          hairLength: "medium",
          eyeColor: "hazel",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "smiling"
        }
      },
      {
        name: "Scarlett",
        imageUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "red",
          hairLength: "long",
          eyeColor: "green",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "neutral"
        }
      },
      {
        name: "Victor",
        imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "gray",
          hairLength: "short",
          eyeColor: "blue",
          hasGlasses: false,
          hasFacialHair: false,
          age: "middle-aged",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "serious"
        }
      },
      {
        name: "Keisha",
        imageUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "female",
          hairColor: "black",
          hairLength: "long",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: false,
          age: "young",
          skinTone: "dark",
          hasHat: false,
          hasEarrings: true,
          expression: "smiling"
        }
      },
      {
        name: "Daniel",
        imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face",
        attributes: {
          gender: "male",
          hairColor: "brown",
          hairLength: "short",
          eyeColor: "brown",
          hasGlasses: false,
          hasFacialHair: true,
          age: "middle-aged",
          skinTone: "light",
          hasHat: false,
          hasEarrings: false,
          expression: "smiling"
        }
      }
    ];

    characterData.forEach((data, index) => {
      const character: Character = {
        id: `char_${index + 1}`,
        name: data.name,
        imageUrl: data.imageUrl,
        attributes: data.attributes,
      };
      this.characters.set(character.id, character);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const character: Character = { ...insertCharacter, id };
    this.characters.set(id, character);
    return character;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = { 
      ...insertGame, 
      id,
      createdAt: new Date(),
      status: insertGame.status || "active",
      currentTurn: insertGame.currentTurn || "ai", // AI goes first
      turnCount: insertGame.turnCount || 1,
      playerCharacterId: insertGame.playerCharacterId || null,
      aiCharacterId: insertGame.aiCharacterId || null,
      eliminatedCharacters: insertGame.eliminatedCharacters || [],
    };
    this.games.set(id, game);
    this.gameHistory.set(id, []);
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    const existingGame = this.games.get(id);
    if (!existingGame) {
      throw new Error(`Game with id ${id} not found`);
    }
    const updatedGame = { ...existingGame, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async addGameHistory(insertHistory: InsertGameHistory): Promise<GameHistoryEntry> {
    const id = randomUUID();
    const history: GameHistoryEntry = {
      ...insertHistory,
      id,
      timestamp: new Date(),
      response: insertHistory.response || null,
    };
    
    const gameHistoryList = this.gameHistory.get(insertHistory.gameId) || [];
    gameHistoryList.push(history);
    this.gameHistory.set(insertHistory.gameId, gameHistoryList);
    
    return history;
  }

  async getGameHistory(gameId: string): Promise<GameHistoryEntry[]> {
    return this.gameHistory.get(gameId) || [];
  }
}

export const storage = new MemStorage();
