import { useState, useEffect } from "react";
import { useGame } from "@/hooks/use-game";
import { GameHeader } from "@/components/game-header";
import { CharacterBoard } from "@/components/character-board";
import { AIOpponent } from "@/components/ai-opponent";
import { TurnIndicator } from "@/components/turn-indicator";
import { QuestionInput } from "@/components/question-input";
import { GameActions } from "@/components/game-actions";
import { GameHistory } from "@/components/game-history";
import { GameResultModal } from "@/components/game-result-modal";
import { CharacterSelectionModal } from "@/components/character-selection-modal";
import { PlayerCharacterDisplay } from "@/components/player-character-display";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function GamePage() {
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameResult, setGameResult] = useState<{
    status: "won" | "lost" | "ai_won" | "draw";
    aiCharacterName?: string;
    playerCharacterName?: string;
    guessedCharacterName?: string;
  } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCharacterSelectionOpen, setIsCharacterSelectionOpen] = useState(false);
  const { toast } = useToast();

  const {
    characters,
    game,
    history,
    selectedCharacterIds,
    isLoadingCharacters,
    isLoadingGame,
    createGame,
    askAI,
    getAIQuestion,
    respondToAI,
    makeGuess,
    makeAIGuess,
    toggleCharacterSelection,
    eliminateSelected,
    isCreatingGame,
    isAskingAI,
    isGettingAIQuestion,
    isRespondingToAI,
    isMakingGuess,
    isMakingAIGuess,
    isEliminatingCharacters,
    aiResponse,
    aiQuestion,
    guessResult,
    aiGuessResult,
  } = useGame(currentGameId);

  // Open character selection when components are ready but no game exists
  useEffect(() => {
    if (characters && characters.length > 0 && !currentGameId) {
      setIsCharacterSelectionOpen(true);
    }
  }, [characters]);

  // Handle game result
  useEffect(() => {
    if (guessResult) {
      const aiCharacter = characters?.find(c => c.id === guessResult.aiCharacterId);
      const status = guessResult.correct ? "won" : "lost";
      setGameResult({
        status,
        aiCharacterName: aiCharacter?.name,
      });
      setIsResultModalOpen(true);

      // Update scores
      if (guessResult.correct) {
        setPlayerScore(prev => prev + 1);
      } else {
        setAiScore(prev => prev + 1);
      }
    }
  }, [guessResult, characters]);

  // Handle AI guess result
  useEffect(() => {
    if (aiGuessResult) {
      const aiCharacter = characters?.find(c => c.id === game?.aiCharacterId);
      const playerCharacter = characters?.find(c => c.id === game?.playerCharacterId);
      
      const status = aiGuessResult.correct ? "ai_won" : game?.status || "active";
      setGameResult({
        status: status as "won" | "lost" | "ai_won" | "draw",
        aiCharacterName: aiCharacter?.name,
        playerCharacterName: playerCharacter?.name,
      });
      setIsResultModalOpen(true);

      // Update scores
      if (aiGuessResult.correct) {
        setAiScore(prev => prev + 1);
      }
    }
  }, [aiGuessResult, characters, game?.aiCharacterId, game?.playerCharacterId, game?.status]);

  // Auto-get AI question when it's AI's turn
  useEffect(() => {
    if (game?.currentTurn === "ai" && game?.status === "active" && !aiQuestion) {
      getAIQuestion(game.id);
    }
  }, [game?.currentTurn, game?.status, game?.id]); // Removed aiQuestion from dependencies to prevent race condition

  const startNewGame = () => {
    if (!characters || characters.length === 0) return;
    setIsCharacterSelectionOpen(true);
  };

  const handleCharacterSelected = (playerCharacterId: string, aiCharacterId: string) => {
    createGame(
      { playerCharacterId, aiCharacterId },
      {
        onSuccess: (newGame) => {
          setCurrentGameId(newGame.id);
          setGameResult(null);
          setIsResultModalOpen(false);
          setIsCharacterSelectionOpen(false);
        },
      }
    );
  };

  const handleAskQuestion = (question: string) => {
    if (!currentGameId) return;
    askAI({ gameId: currentGameId, question });
  };

  const handleRespondToAI = (response: "yes" | "no") => {
    if (!currentGameId) return;
    respondToAI({ gameId: currentGameId, response });
  };

  const handleMakeGuess = () => {
    if (!currentGameId || selectedCharacterIds.size !== 1) {
      toast({
        title: "Select One Character",
        description: "Please select exactly one character to make your final guess.",
        variant: "destructive",
      });
      return;
    }

    const characterId = Array.from(selectedCharacterIds)[0];
    makeGuess({ gameId: currentGameId, characterId });
  };

  const handleSurrender = () => {
    if (!currentGameId || !game?.aiCharacterId) return;
    
    const aiCharacter = characters?.find(c => c.id === game.aiCharacterId);
    setGameResult({
      status: "lost",
      aiCharacterName: aiCharacter?.name,
    });
    setIsResultModalOpen(true);
    setAiScore(prev => prev + 1);
  };

  const eliminatedCharacters = game?.eliminatedCharacters || [];
  const isPlayerTurn = game?.currentTurn === "player";
  const isGameActive = game?.status === "active";

  if (isLoadingCharacters) {
    return (
      <div className="min-h-screen mystical-bg">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="min-h-screen mystical-bg flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Characters Available</h2>
          <p className="text-muted-foreground">
            Unable to load character data. Please try refreshing the page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen mystical-bg">
      <GameHeader playerScore={playerScore} aiScore={aiScore} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Character Board */}
          <div className="lg:col-span-2">
            <CharacterBoard
              characters={characters}
              eliminatedCharacters={eliminatedCharacters}
              selectedCharacterIds={selectedCharacterIds}
              onCharacterClick={toggleCharacterSelection}
              onEliminateSelected={eliminateSelected}
              isEliminatingCharacters={isEliminatingCharacters}
            />
          </div>

          {/* Game Interface */}
          <div className="space-y-6">
            {/* Player Character Display */}
            {game?.playerCharacterId && characters && (
              <PlayerCharacterDisplay
                character={characters.find(c => c.id === game.playerCharacterId)!}
              />
            )}
            {/* AI Opponent */}
            <AIOpponent
              aiQuestion={aiQuestion || undefined}
              isAIThinking={isGettingAIQuestion}
              onRespondYes={() => handleRespondToAI("yes")}
              onRespondNo={() => handleRespondToAI("no")}
              isRespondingToAI={isRespondingToAI}
              aiGuess={aiGuessResult ? {
                characterName: aiGuessResult.characterName,
                correct: aiGuessResult.correct,
                reasoning: aiGuessResult.reasoning
              } : undefined}
            />

            {/* Turn Indicator */}
            {game && (
              <TurnIndicator
                currentTurn={game.currentTurn}
                turnCount={game.turnCount}
              />
            )}

            {/* Question Input - only show on player turn */}
            {isPlayerTurn && isGameActive && (
              <QuestionInput
                onAskQuestion={handleAskQuestion}
                isAskingAI={isAskingAI}
                disabled={!isGameActive}
              />
            )}

            {/* Game Actions */}
            <GameActions
              onMakeGuess={handleMakeGuess}
              onNewGame={startNewGame}
              onSurrender={handleSurrender}
              disabled={!isGameActive || isCreatingGame}
            />
          </div>
        </div>

        {/* Game History */}
        {history && (
          <div className="mt-8">
            <GameHistory history={history} />
          </div>
        )}
      </div>

      {/* Game Result Modal */}
      <GameResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        result={gameResult}
        onPlayAgain={startNewGame}
        onViewStats={() => {
          toast({
            title: "Coming Soon",
            description: "Statistics feature will be available soon!",
          });
        }}
      />

      {/* Character Selection Modal */}
      <CharacterSelectionModal
        isOpen={isCharacterSelectionOpen}
        characters={characters || []}
        onCharacterSelected={handleCharacterSelected}
        onClose={() => setIsCharacterSelectionOpen(false)}
        isLoading={isCreatingGame}
      />
    </div>
  );
}
