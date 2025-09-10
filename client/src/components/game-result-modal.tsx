import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, X, Bot, Handshake } from "lucide-react";

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    status: "won" | "lost" | "ai_won" | "draw";
    aiCharacterName?: string;
    playerCharacterName?: string;
    guessedCharacterName?: string;
  } | null;
  onPlayAgain: () => void;
  onViewStats: () => void;
}

export function GameResultModal({
  isOpen,
  onClose,
  result,
  onPlayAgain,
  onViewStats,
}: GameResultModalProps) {
  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-game-result">
        <DialogHeader>
          <div className="text-center">
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                result.status === "won"
                  ? "bg-gradient-to-br from-green-500 to-green-600"
                  : result.status === "ai_won"
                  ? "bg-gradient-to-br from-orange-500 to-orange-600" 
                  : result.status === "draw"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-red-500 to-red-600"
              }`}
            >
              {result.status === "won" && <Trophy className="h-10 w-10 text-white" />}
              {result.status === "lost" && <X className="h-10 w-10 text-white" />}
              {result.status === "ai_won" && <Bot className="h-10 w-10 text-white" />}
              {result.status === "draw" && <Handshake className="h-10 w-10 text-white" />}
            </div>
            <DialogTitle className="text-2xl font-display font-bold text-foreground mb-4">
              {result.status === "won" && "You Won!"}
              {result.status === "lost" && "Game Over"}
              {result.status === "ai_won" && "AI Won!"}
              {result.status === "draw" && "It's a Draw!"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              {result.status === "won" && `Congratulations! You correctly guessed ${result.aiCharacterName}!`}
              {result.status === "lost" && `The mystery character was ${result.aiCharacterName}. Better luck next time!`}
              {result.status === "ai_won" && `The AI correctly guessed your character: ${result.playerCharacterName}! The AI's character was ${result.aiCharacterName}.`}
              {result.status === "draw" && "Both players made incorrect final guesses! It's a tie."} 
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            className="w-full"
            data-testid="button-play-again"
          >
            Play Again
          </Button>
          <Button
            onClick={onViewStats}
            variant="outline"
            className="w-full"
            data-testid="button-view-stats"
          >
            View Statistics
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
