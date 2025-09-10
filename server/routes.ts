import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { grokService } from "./services/grok";
import { insertGameSchema, insertGameHistorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all characters
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  // Create a new game
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid game data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create game" });
      }
    }
  });

  // Get game by ID
  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Update game
  app.patch("/api/games/:id", async (req, res) => {
    try {
      const updates = req.body;
      const game = await storage.updateGame(req.params.id, updates);
      res.json(game);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        res.status(404).json({ message: "Game not found" });
      } else {
        res.status(500).json({ message: "Failed to update game" });
      }
    }
  });

  // Ask AI a question (player turn)
  app.post("/api/games/:id/ask-ai", async (req, res) => {
    try {
      const { question } = req.body;
      const gameId = req.params.id;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ message: "Question is required" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      if (!game.aiCharacterId) {
        return res.status(400).json({ message: "AI character not set" });
      }

      // Get the AI's character
      const aiCharacter = await storage.getCharacter(game.aiCharacterId);
      if (!aiCharacter) {
        return res.status(400).json({ message: "AI character not found" });
      }

      // Ask Grok to answer the question about the AI's character
      const response = await grokService.answerQuestion(question, aiCharacter.attributes as any);

      // Add player question to history
      await storage.addGameHistory({
        gameId,
        type: "player_question",
        content: question,
        response: response.answer,
      });

      // Update game turn count and set to AI turn
      await storage.updateGame(gameId, {
        currentTurn: "ai",
        turnCount: game.turnCount + 1,
      });

      res.json({ 
        answer: response.answer,
        reasoning: response.reasoning,
      });
    } catch (error) {
      console.error("Error asking AI:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Get AI's question (AI turn)
  app.post("/api/games/:id/ai-question", async (req, res) => {
    try {
      const gameId = req.params.id;
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const eliminatedCharacters = Array.isArray(game.eliminatedCharacters) 
        ? game.eliminatedCharacters as string[]
        : [];

      // Get all characters to understand the remaining options
      const allCharacters = await storage.getAllCharacters();
      const remainingCharacters = allCharacters.filter(char => 
        !eliminatedCharacters.includes(char.id)
      );

      // Get game history for context
      const history = await storage.getGameHistory(gameId);

      // Generate AI question using Grok
      const aiQuestion = await grokService.generateQuestion(remainingCharacters, history);

      // Add AI question to history
      await storage.addGameHistory({
        gameId,
        type: "ai_question",
        content: aiQuestion.question,
      });

      res.json({ 
        question: aiQuestion.question,
        reasoning: aiQuestion.reasoning,
      });
    } catch (error) {
      console.error("Error generating AI question:", error);
      res.status(500).json({ message: "Failed to generate AI question" });
    }
  });

  // Respond to AI's question (player responds)
  app.post("/api/games/:id/respond", async (req, res) => {
    try {
      const { response } = req.body;
      const gameId = req.params.id;

      if (!response || !["yes", "no"].includes(response.toLowerCase())) {
        return res.status(400).json({ message: "Response must be 'yes' or 'no'" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Get the latest AI question from history
      const history = await storage.getGameHistory(gameId);
      const latestAiQuestion = history
        .filter(h => h.type === "ai_question")
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      if (!latestAiQuestion) {
        return res.status(400).json({ message: "No AI question to respond to" });
      }

      // Add player response to history
      await storage.addGameHistory({
        gameId,
        type: "player_response",
        content: response,
      });

      // Get updated history for AI processing
      const updatedHistory = await storage.getGameHistory(gameId);
      
      // Get all characters for AI decision making
      const characters = await storage.getAllCharacters();

      // Let AI process the response and eliminate characters
      let aiEliminationResponse;
      try {
        aiEliminationResponse = await grokService.processPlayerResponse(
          characters,
          latestAiQuestion.content,
          response,
          updatedHistory
        );
      } catch (error) {
        console.error("Error in AI processing:", error);
        aiEliminationResponse = { 
          eliminatedCharacters: [], 
          reasoning: "AI had trouble processing your response, but the game continues" 
        };
      }

      // If AI eliminated characters, add to history
      if (aiEliminationResponse.eliminatedCharacters && aiEliminationResponse.eliminatedCharacters.length > 0) {
        await storage.addGameHistory({
          gameId,
          type: "ai_elimination",
          content: `AI eliminated: ${aiEliminationResponse.eliminatedCharacters.join(", ")} based on your "${response}" response`,
        });
      }

      // Get final updated history for decision making
      const finalHistory = await storage.getGameHistory(gameId);
      const turnCount = finalHistory.filter(h => h.type === "ai_question").length;
      
      // Check if AI wants to make a guess
      const shouldGuessResponse = await grokService.shouldMakeGuess(
        characters,
        finalHistory,
        turnCount
      );

      if (shouldGuessResponse.shouldGuess) {
        // AI decides to make a guess instead of asking another question
        const aiGuess = await grokService.makeGuess(characters, finalHistory);
        
        // Add AI guess to history
        await storage.addGameHistory({
          gameId,
          type: "ai_guess",
          content: `AI guessed: ${aiGuess.characterName}`,
        });

        // Check if the guess is correct
        const correct = aiGuess.guessedCharacterId === game.playerCharacterId;
        
        if (correct) {
          // AI wins!
          await storage.updateGame(gameId, {
            status: "ai_won",
          });
          
          res.json({ 
            success: true,
            aiGuessed: true,
            guessedCharacter: aiGuess.characterName,
            correct: true,
            gameEnded: true,
            reasoning: aiGuess.reasoning
          });
        } else {
          // AI guessed wrong, check if game should end in draw
          const totalTurns = finalHistory.filter(h => 
            h.type === "player_question" || h.type === "ai_question"
          ).length;
          
          if (totalTurns >= 15) {
            // Very late in the game, end as draw
            await storage.updateGame(gameId, { status: "draw" });
            res.json({ 
              success: true,
              aiGuessed: true,
              guessedCharacter: aiGuess.characterName,
              correct: false,
              gameEnded: true,
              status: "draw",
              reasoning: aiGuess.reasoning,
              message: "Game ended in a draw due to turn limit"
            });
          } else {
            // Continue with player turn
            await storage.updateGame(gameId, {
              currentTurn: "player",
            });
            
            res.json({ 
              success: true,
              aiGuessed: true,
              guessedCharacter: aiGuess.characterName,
              correct: false,
              gameEnded: false,
              reasoning: aiGuess.reasoning
            });
          }
        }
      } else {
        // AI didn't make a guess, switch to player's turn
        await storage.updateGame(gameId, {
          currentTurn: "player",
        });

        res.json({ 
          success: true,
          nextAction: "player_turn", // Signal that it's now player's turn
          aiEliminated: aiEliminationResponse.eliminatedCharacters || [],
          aiReasoning: aiEliminationResponse.reasoning || "AI processed your response"
        });
      }
    } catch (error) {
      console.error("Error responding to AI:", error);
      res.status(500).json({ message: "Failed to record response" });
    }
  });

  // Eliminate characters
  app.post("/api/games/:id/eliminate", async (req, res) => {
    try {
      const { characterIds } = req.body;
      const gameId = req.params.id;

      if (!Array.isArray(characterIds)) {
        return res.status(400).json({ message: "characterIds must be an array" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const currentEliminated = Array.isArray(game.eliminatedCharacters) 
        ? game.eliminatedCharacters as string[]
        : [];

      const newEliminated = Array.from(new Set([...currentEliminated, ...characterIds]));

      await storage.updateGame(gameId, {
        eliminatedCharacters: newEliminated,
      });

      res.json({ eliminatedCharacters: newEliminated });
    } catch (error) {
      console.error("Error eliminating characters:", error);
      res.status(500).json({ message: "Failed to eliminate characters" });
    }
  });

  // Make final guess
  app.post("/api/games/:id/guess", async (req, res) => {
    try {
      const { characterId } = req.body;
      const gameId = req.params.id;

      if (!characterId) {
        return res.status(400).json({ message: "characterId is required" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const isCorrect = game.aiCharacterId === characterId;
      
      // Add player guess to history
      const characters = await storage.getAllCharacters();
      const guessedCharacter = characters.find(c => c.id === characterId);
      await storage.addGameHistory({
        gameId,
        type: "player_guess",
        content: `Player guessed: ${guessedCharacter?.name || 'Unknown'}`,
      });

      // Get game history to check turn count
      const history = await storage.getGameHistory(gameId);
      const totalTurns = history.filter(h => 
        h.type === "player_question" || h.type === "ai_question"
      ).length;

      if (isCorrect) {
        // Player wins immediately
        await storage.updateGame(gameId, { status: "won" });
        res.json({ 
          correct: true,
          aiCharacterId: game.aiCharacterId,
          status: "won",
        });
      } else {
        // Player guessed wrong
        if (totalTurns >= 15) {
          // Very late in the game, end as draw to avoid infinite games
          await storage.updateGame(gameId, { status: "draw" });
          res.json({ 
            correct: false,
            aiCharacterId: game.aiCharacterId,
            status: "draw",
            message: "Game ended in a draw due to turn limit"
          });
        } else if (totalTurns >= 10) {
          // Late in the game, player loses after wrong guess
          await storage.updateGame(gameId, { status: "lost" });
          res.json({ 
            correct: false,
            aiCharacterId: game.aiCharacterId,
            status: "lost",
          });
        } else {
          // Early/mid game, continue playing but switch to AI turn
          await storage.updateGame(gameId, { currentTurn: "ai" });
          res.json({ 
            correct: false,
            aiCharacterId: game.aiCharacterId,
            status: "active",
            continueGame: true,
          });
        }
      }
    } catch (error) {
      console.error("Error making guess:", error);
      res.status(500).json({ message: "Failed to process guess" });
    }
  });

  // AI makes final guess about player's character
  app.post("/api/games/:id/ai-guess", async (req, res) => {
    try {
      const gameId = req.params.id;

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      if (!game.playerCharacterId) {
        return res.status(400).json({ message: "No player character to guess" });
      }

      // Get all characters for the AI to choose from
      const allCharacters = await storage.getAllCharacters();
      
      // Get conversation history for context
      const history = await storage.getGameHistory(gameId);

      // Ask AI to make a guess based on the conversation
      const aiGuessResponse = await grokService.makeGuess(allCharacters, history);

      // Check if AI's guess is correct
      const isCorrect = game.playerCharacterId === aiGuessResponse.guessedCharacterId;
      const status = isCorrect ? "ai_won" : game.status; // Keep current status if AI is wrong

      // Add AI guess to history
      await storage.addGameHistory({
        gameId,
        type: "ai_response",
        content: `I guess your character is: ${aiGuessResponse.characterName}`,
        response: isCorrect ? "correct" : "incorrect",
      });

      await storage.updateGame(gameId, { status });

      res.json({
        correct: isCorrect,
        guessedCharacterId: aiGuessResponse.guessedCharacterId,
        characterName: aiGuessResponse.characterName,
        reasoning: aiGuessResponse.reasoning,
        status,
      });
    } catch (error) {
      console.error("Error making AI guess:", error);
      res.status(500).json({ message: "Failed to process AI guess" });
    }
  });

  // Get game history
  app.get("/api/games/:id/history", async (req, res) => {
    try {
      const history = await storage.getGameHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
