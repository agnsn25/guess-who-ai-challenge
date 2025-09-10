import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Settings } from "lucide-react";

interface GameHeaderProps {
  playerScore: number;
  aiScore: number;
}

export function GameHeader({ playerScore, aiScore }: GameHeaderProps) {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Guess Who: AI Challenge
              </h1>
              <p className="text-sm text-muted-foreground">Powered by XAI Grok</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-500" data-testid="text-player-score">
                {playerScore}
              </div>
              <div className="text-xs text-muted-foreground">Your Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-destructive" data-testid="text-ai-score">
                {aiScore}
              </div>
              <div className="text-xs text-muted-foreground">AI Wins</div>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
