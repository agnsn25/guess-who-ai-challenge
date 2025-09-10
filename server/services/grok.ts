import OpenAI from "openai";
import { type CharacterAttributes, type Character, type GameHistoryEntry } from "@shared/schema";

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || process.env.GROK_API_KEY || "fallback_key"
});

export interface QuestionResponse {
  answer: "yes" | "no";
  reasoning: string;
}

export interface GeneratedQuestion {
  question: string;
  reasoning: string;
}

export interface AIGuessResponse {
  guessedCharacterId: string;
  characterName: string;
  reasoning: string;
}

export interface ShouldGuessResponse {
  shouldGuess: boolean;
  reasoning: string;
  confidence: number; // 0-100 scale
}

class GrokService {
  async answerQuestion(question: string, characterAttributes: CharacterAttributes): Promise<QuestionResponse> {
    try {
      const prompt = `You are playing Guess Who. A player is asking about a character with these attributes:

Character Attributes:
${JSON.stringify(characterAttributes, null, 2)}

Player's Question: "${question}"

You must answer ONLY with "yes" or "no" based on whether the question is true for this character. Also provide brief reasoning.

Respond with JSON in this exact format:
{
  "answer": "yes" or "no",
  "reasoning": "Brief explanation of why this answer is correct"
}`;

      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are an expert Guess Who game player. Always respond with valid JSON containing 'answer' (yes/no) and 'reasoning' fields."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        answer: result.answer?.toLowerCase() === "yes" ? "yes" : "no",
        reasoning: result.reasoning || "Based on character attributes",
      };
    } catch (error) {
      console.error("Error calling Grok API:", error);
      // Fallback response
      return {
        answer: "no",
        reasoning: "Unable to process question at this time",
      };
    }
  }

  async generateQuestion(
    remainingCharacters: Character[], 
    gameHistory: GameHistoryEntry[]
  ): Promise<GeneratedQuestion> {
    try {
      // Analyze remaining characters to find the best distinguishing question
      const attributes = remainingCharacters.map(char => char.attributes);
      
      // Get previous questions to avoid repetition
      const previousQuestions = gameHistory
        .filter(h => h.type === "ai_question" || h.type === "player_question")
        .map(h => h.content);

      const prompt = `You are an AI playing Guess Who. You need to ask a strategic question to narrow down the remaining characters.

Remaining Characters (${remainingCharacters.length}):
${remainingCharacters.map(char => `${char.name}: ${JSON.stringify(char.attributes)}`).join('\n')}

Previous Questions Asked:
${previousQuestions.length > 0 ? previousQuestions.join('\n') : 'None'}

Generate a strategic yes/no question that will best eliminate characters and help you win. Avoid asking questions that have already been asked. Focus on attributes that will split the remaining characters roughly in half.

Respond with JSON in this exact format:
{
  "question": "Your strategic question here",
  "reasoning": "Why this question is strategically optimal"
}`;

      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a strategic Guess Who AI player. Generate questions that optimally eliminate characters. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        question: result.question || "Does your character have brown hair?",
        reasoning: result.reasoning || "Strategic question to eliminate characters",
      };
    } catch (error) {
      console.error("Error generating AI question:", error);
      // Fallback questions
      const fallbackQuestions = [
        "Does your character wear glasses?",
        "Does your character have facial hair?",
        "Is your character male?",
        "Does your character have brown hair?",
        "Is your character young?",
      ];
      
      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      
      return {
        question: randomQuestion,
        reasoning: "Fallback strategic question",
      };
    }
  }

  async makeGuess(
    allCharacters: Character[], 
    gameHistory: GameHistoryEntry[]
  ): Promise<AIGuessResponse> {
    try {
      // Analyze conversation history to make an educated guess
      const playerResponses = gameHistory.filter(h => h.type === "player_response");
      const aiQuestions = gameHistory.filter(h => h.type === "ai_question");
      
      // Build context from the conversation
      const conversationContext = aiQuestions.map((q, index) => {
        const response = playerResponses[index]?.content || "no response";
        return `AI asked: "${q.content}" - Player answered: "${response}"`;
      }).join('\n');

      const prompt = `You are an AI playing Guess Who. Based on the conversation history, you need to make a final guess about the player's character.

Available Characters:
${allCharacters.map(char => `${char.name} (ID: ${char.id}): ${JSON.stringify(char.attributes)}`).join('\n')}

Conversation History:
${conversationContext || 'No conversation yet'}

Based on the player's answers to your questions, analyze which character best matches their responses. Make your best guess!

Respond with JSON in this exact format:
{
  "guessedCharacterId": "the character ID you're guessing",
  "characterName": "the character name",
  "reasoning": "Detailed explanation of why you chose this character based on the conversation"
}`;

      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a strategic Guess Who AI player making a final guess. Analyze conversation history carefully and make the most logical choice. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate that the guessed character exists
      const guessedCharacter = allCharacters.find(char => 
        char.id === result.guessedCharacterId || char.name === result.characterName
      );
      
      if (!guessedCharacter) {
        // Fallback to random character if AI's guess is invalid
        const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
        return {
          guessedCharacterId: randomCharacter.id,
          characterName: randomCharacter.name,
          reasoning: "Made a random guess due to analysis error",
        };
      }

      return {
        guessedCharacterId: guessedCharacter.id,
        characterName: guessedCharacter.name,
        reasoning: result.reasoning || "Based on conversation analysis",
      };
    } catch (error) {
      console.error("Error making AI guess:", error);
      
      // Fallback to random character
      const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      return {
        guessedCharacterId: randomCharacter.id,
        characterName: randomCharacter.name,
        reasoning: "Random guess due to service error",
      };
    }
  }

  async processPlayerResponse(
    allCharacters: Character[],
    aiQuestion: string,
    playerResponse: string,
    gameHistory: GameHistoryEntry[]
  ): Promise<{ eliminatedCharacters: string[]; reasoning: string }> {
    try {
      const prompt = `You are playing Guess Who and just asked: "${aiQuestion}"

The player responded: "${playerResponse}"

Based on this response, which characters should you eliminate from your board?

Available characters:
${allCharacters.map(c => `- ${c.name}: ${JSON.stringify(c.attributes)}`).join('\n')}

Game history:
${gameHistory.map(h => `${h.type}: ${h.content}`).join('\n')}

Think step by step:
1. What does the player's "${playerResponse}" response tell you about their character?
2. Which characters can you now eliminate based on this information?
3. What is your reasoning?

Respond with JSON:
{
  "eliminatedCharacters": ["character names to eliminate"],
  "reasoning": "why you eliminated these characters"
}`;

      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 500, // Limit response size
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { eliminatedCharacters: [], reasoning: "No response from AI" };
      }

      const parsed = JSON.parse(content);
      return {
        eliminatedCharacters: parsed.eliminatedCharacters || [],
        reasoning: parsed.reasoning || "AI processed your response"
      };
    } catch (error) {
      console.error("Error processing player response:", error);
      return { eliminatedCharacters: [], reasoning: "Error processing response" };
    }
  }

  async shouldMakeGuess(
    allCharacters: Character[], 
    gameHistory: GameHistoryEntry[],
    turnCount: number
  ): Promise<ShouldGuessResponse> {
    try {
      // Simple rule-based logic first
      if (turnCount < 3) {
        return {
          shouldGuess: false,
          reasoning: "Too early in the game, need more information",
          confidence: 0
        };
      }

      if (turnCount >= 8) {
        return {
          shouldGuess: true,
          reasoning: "Many turns have passed, time to make a strategic guess",
          confidence: 75
        };
      }

      // Use AI to analyze if enough information has been gathered
      const playerResponses = gameHistory.filter(h => h.type === "player_response");
      const aiQuestions = gameHistory.filter(h => h.type === "ai_question");
      
      const conversationContext = aiQuestions.map((q, index) => {
        const response = playerResponses[index]?.content || "no response";
        return `AI asked: "${q.content}" - Player answered: "${response}"`;
      }).join('\n');

      const prompt = `You are an AI playing Guess Who. Analyze the conversation to determine if you have enough information to make a confident guess about the player's character.

Available Characters (${allCharacters.length} total):
${allCharacters.map(char => `${char.name}: ${JSON.stringify(char.attributes)}`).join('\n')}

Conversation History (${turnCount} turns):
${conversationContext || 'No conversation yet'}

Based on the player's responses, do you have enough information to make a confident guess? Consider:
- How many characters have been eliminated based on responses
- Whether you have a clear frontrunner character
- Strategic timing (not too early, not too late)

Respond with JSON in this exact format:
{
  "shouldGuess": true or false,
  "reasoning": "Detailed explanation of your decision",
  "confidence": number from 0-100 indicating your confidence level
}`;

      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a strategic AI analyzing when to make a final guess in Guess Who. Be strategic about timing. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        shouldGuess: result.shouldGuess === true,
        reasoning: result.reasoning || "Strategic timing analysis",
        confidence: Math.max(0, Math.min(100, result.confidence || 50)),
      };
    } catch (error) {
      console.error("Error analyzing if AI should guess:", error);
      
      // Fallback logic based on turn count
      if (turnCount >= 6) {
        return {
          shouldGuess: true,
          reasoning: "Fallback: enough turns have passed",
          confidence: 60
        };
      }
      
      return {
        shouldGuess: false,
        reasoning: "Fallback: need more information",
        confidence: 30
      };
    }
  }
}

export const grokService = new GrokService();
