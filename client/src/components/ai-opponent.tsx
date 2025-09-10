import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, HelpCircle, KeyRound, Target } from "lucide-react";

interface AIOpponentProps {
  aiQuestion?: string;
  isAIThinking: boolean;
  onRespondYes: () => void;
  onRespondNo: () => void;
  isRespondingToAI: boolean;
  aiGuess?: {
    characterName: string;
    correct: boolean;
    reasoning?: string;
  };
}

export function AIOpponent({
  aiQuestion,
  isAIThinking,
  onRespondYes,
  onRespondNo,
  isRespondingToAI,
  aiGuess,
}: AIOpponentProps) {
  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <div className={cn(
            "w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center",
            isAIThinking && "ai-thinking"
          )}>
            <Bot className="h-8 w-8 text-white" />
          </div>
          <Badge
            variant="default"
            className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-card p-0"
          />
        </div>
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Grok AI
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAIThinking ? "Thinking strategically..." : "Ready to play"}
          </p>
        </div>
      </div>

      {aiQuestion && (
        <>
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium mb-2">
                  AI's Question:
                </p>
                <p className="text-sm text-card-foreground" data-testid="text-ai-question">
                  "{aiQuestion}"
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mb-4">
            <Button
              onClick={onRespondYes}
              disabled={isRespondingToAI}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium"
              data-testid="button-respond-yes"
            >
              ✓ Yes
            </Button>
            <Button
              onClick={onRespondNo}
              disabled={isRespondingToAI}
              variant="destructive"
              className="flex-1 py-3 px-4 rounded-lg font-medium"
              data-testid="button-respond-no"
            >
              ✗ No
            </Button>
          </div>
        </>
      )}

      {aiGuess && (
        <div className={`rounded-lg p-4 mb-4 ${aiGuess.correct ? 'bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${aiGuess.correct ? 'bg-orange-500' : 'bg-blue-500'}`}>
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">
                AI's Final Guess:
              </p>
              <p className="text-sm mb-2" data-testid="text-ai-guess">
                "Is your character <strong>{aiGuess.characterName}</strong>?"
              </p>
              {aiGuess.reasoning && (
                <p className="text-xs text-muted-foreground italic">
                  {aiGuess.reasoning}
                </p>
              )}
              <Badge 
                variant={aiGuess.correct ? "destructive" : "secondary"}
                className="mt-2"
              >
                {aiGuess.correct ? "AI Won!" : "Wrong Guess"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg mb-3 flex items-center justify-center border-2 border-dashed border-accent/50">
          <KeyRound className="h-8 w-8 text-accent" />
        </div>
        <p className="text-xs text-muted-foreground">AI's Mystery Character</p>
      </div>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
