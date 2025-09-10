import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RotateCcw, Flag } from "lucide-react";

interface GameActionsProps {
  onMakeGuess: () => void;
  onNewGame: () => void;
  onSurrender: () => void;
  disabled?: boolean;
}

export function GameActions({
  onMakeGuess,
  onNewGame,
  onSurrender,
  disabled,
}: GameActionsProps) {
  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">
        Game Actions
      </h3>

      <div className="space-y-3">
        <Button
          onClick={onMakeGuess}
          disabled={disabled}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          data-testid="button-make-guess"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Make Final Guess
        </Button>

        <Button
          onClick={onNewGame}
          variant="outline"
          className="w-full"
          data-testid="button-new-game"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Game
        </Button>

        <Button
          onClick={onSurrender}
          variant="outline"
          className="w-full"
          data-testid="button-surrender"
        >
          <Flag className="h-4 w-4 mr-2" />
          Surrender
        </Button>
      </div>
    </Card>
  );
}
