import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gameApi, type Character, type Game, type GameHistoryEntry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useGame(gameId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(new Set());
  const [aiGuessFromResponse, setAiGuessFromResponse] = useState<any>(null);
  const [currentAiQuestion, setCurrentAiQuestion] = useState<string | null>(null);

  // Get all characters
  const charactersQuery = useQuery({
    queryKey: ["/api/characters"],
    enabled: true,
  });

  // Get current game
  const gameQuery = useQuery({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId,
  });

  // Get game history
  const historyQuery = useQuery({
    queryKey: ["/api/games", gameId, "history"],
    enabled: !!gameId,
  });

  // Create new game mutation
  const createGameMutation = useMutation({
    mutationFn: ({ playerCharacterId, aiCharacterId }: { playerCharacterId?: string; aiCharacterId?: string }) =>
      gameApi.createGame(playerCharacterId, aiCharacterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setAiGuessFromResponse(null); // Clear any previous AI guess results
      toast({
        title: "Game Created",
        description: "New game started successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new game",
        variant: "destructive",
      });
    },
  });

  // Ask AI mutation
  const askAIMutation = useMutation({
    mutationFn: ({ gameId, question }: { gameId: string; question: string }) =>
      gameApi.askAI(gameId, question),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "history"] });
      toast({
        title: `AI Answer: ${data.answer.toUpperCase()}`,
        description: data.reasoning,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  // Get AI question mutation
  const getAIQuestionMutation = useMutation({
    mutationFn: (gameId: string) => gameApi.getAIQuestion(gameId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "history"] });
      setCurrentAiQuestion(data.question || data); // Store the AI question text
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI question",
        variant: "destructive",
      });
    },
  });

  // Respond to AI mutation
  const respondToAIMutation = useMutation({
    mutationFn: ({ gameId, response }: { gameId: string; response: "yes" | "no" }) =>
      gameApi.respondToAI(gameId, response),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "history"] });
      
      // Clear the AI question since user responded
      setCurrentAiQuestion(null);
      
      // Handle AI guess if it happened
      if (data.aiGuessed) {
        // Set the AI guess result for UI consumption
        setAiGuessFromResponse({
          correct: data.correct,
          characterName: data.guessedCharacter,
          reasoning: data.reasoning || "AI made a strategic guess",
        });
        
        if (data.correct && data.gameEnded) {
          toast({
            title: "AI Won!",
            description: `The AI correctly guessed: ${data.guessedCharacter}!`,
            variant: "destructive",
          });
        } else if (data.status === "draw" && data.gameEnded) {
          toast({
            title: "Draw!",
            description: data.message || "The game ended in a draw.",
          });
        } else if (data.aiGuessed && !data.correct) {
          toast({
            title: "AI's Guess",
            description: `AI guessed: ${data.guessedCharacter} - But that's wrong! Game continues.`,
          });
        }
      }
      
      // If it's now player's turn, show a toast to indicate
      if (data.nextAction === "player_turn") {
        // Show what AI eliminated based on your response
        if (data.aiEliminated && data.aiEliminated.length > 0) {
          toast({
            title: "AI Eliminated Characters",
            description: `AI eliminated: ${data.aiEliminated.join(", ")}. ${data.aiReasoning}`,
          });
        }
        
        setTimeout(() => {
          toast({
            title: "Your Turn!",
            description: "Now it's your turn to ask the AI a question.",
          });
        }, 1500);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record response",
        variant: "destructive",
      });
    },
  });

  // Eliminate characters mutation
  const eliminateCharactersMutation = useMutation({
    mutationFn: ({ gameId, characterIds }: { gameId: string; characterIds: string[] }) =>
      gameApi.eliminateCharacters(gameId, characterIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      setSelectedCharacterIds(new Set());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to eliminate characters",
        variant: "destructive",
      });
    },
  });

  // Make guess mutation
  const makeGuessMutation = useMutation({
    mutationFn: ({ gameId, characterId }: { gameId: string; characterId: string }) =>
      gameApi.makeGuess(gameId, characterId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      if (data.correct) {
        toast({
          title: "Congratulations!",
          description: "You won the game!",
        });
      } else if (data.continueGame) {
        toast({
          title: "Wrong Guess",
          description: "That wasn't correct, but the game continues. It's now the AI's turn!",
          variant: "destructive",
        });
      } else if (data.status === "draw") {
        toast({
          title: "Draw!",
          description: data.message || "The game ended in a draw.",
        });
      } else {
        toast({
          title: "Game Over",
          description: "Better luck next time!",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to make guess",
        variant: "destructive",
      });
    },
  });

  // AI makes guess mutation
  const makeAIGuessMutation = useMutation({
    mutationFn: (gameId: string) => gameApi.makeAIGuess(gameId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "history"] });
      if (data.correct) {
        toast({
          title: "AI Won!",
          description: `The AI correctly guessed: ${data.characterName}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "AI's Guess",
          description: `AI guessed: ${data.characterName} - But that's wrong!`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process AI guess",
        variant: "destructive",
      });
    },
  });

  // Toggle character selection
  const toggleCharacterSelection = useCallback((characterId: string) => {
    setSelectedCharacterIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(characterId)) {
        newSet.delete(characterId);
      } else {
        newSet.add(characterId);
      }
      return newSet;
    });
  }, []);

  // Eliminate selected characters
  const eliminateSelected = useCallback(() => {
    if (!gameId || selectedCharacterIds.size === 0) return;
    eliminateCharactersMutation.mutate({
      gameId,
      characterIds: Array.from(selectedCharacterIds),
    });
  }, [gameId, selectedCharacterIds, eliminateCharactersMutation]);

  return {
    // Data
    characters: charactersQuery.data as Character[] | undefined,
    game: gameQuery.data as Game | undefined,
    history: historyQuery.data as GameHistoryEntry[] | undefined,
    selectedCharacterIds,

    // Loading states
    isLoadingCharacters: charactersQuery.isLoading,
    isLoadingGame: gameQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,

    // Mutations
    createGame: createGameMutation.mutate,
    askAI: askAIMutation.mutate,
    getAIQuestion: getAIQuestionMutation.mutate,
    respondToAI: respondToAIMutation.mutate,
    makeGuess: makeGuessMutation.mutate,
    makeAIGuess: makeAIGuessMutation.mutate,

    // Mutation states
    isCreatingGame: createGameMutation.isPending,
    isAskingAI: askAIMutation.isPending,
    isGettingAIQuestion: getAIQuestionMutation.isPending,
    isRespondingToAI: respondToAIMutation.isPending,
    isMakingGuess: makeGuessMutation.isPending,
    isMakingAIGuess: makeAIGuessMutation.isPending,
    isEliminatingCharacters: eliminateCharactersMutation.isPending,

    // Character selection
    toggleCharacterSelection,
    eliminateSelected,

    // Mutation results
    aiResponse: askAIMutation.data,
    aiQuestion: currentAiQuestion,
    guessResult: makeGuessMutation.data,
    aiGuessResult: makeAIGuessMutation.data || aiGuessFromResponse,
  };
}
