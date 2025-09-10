import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";

interface TurnIndicatorProps {
  currentTurn: "player" | "ai";
  turnCount: number;
}

export function TurnIndicator({ currentTurn, turnCount }: TurnIndicatorProps) {
  const isPlayerTurn = currentTurn === "player";

  return (
    <Card className="p-4 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isPlayerTurn ? "bg-primary" : "bg-accent"
          }`}>
            {isPlayerTurn ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground" data-testid="text-current-turn">
              {isPlayerTurn ? "Your Turn" : "AI's Turn"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPlayerTurn ? "Ask a question" : "AI is thinking..."}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary" data-testid="text-turn-count">
            {turnCount}
          </div>
          <div className="text-xs text-muted-foreground">Turn</div>
        </div>
      </div>
    </Card>
  );
}
