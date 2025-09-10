import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";
import type { GameHistoryEntry } from "@/lib/api";

interface GameHistoryProps {
  history: GameHistoryEntry[];
}

export function GameHistory({ history }: GameHistoryProps) {
  // Sort history by timestamp, most recent first
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">
        Game History
      </h3>

      <ScrollArea className="h-60">
        <div className="space-y-3">
          {sortedHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No history yet. Start asking questions!
            </p>
          ) : (
            sortedHistory.map((entry) => {
              const isPlayer = entry.type.startsWith("player");
              const isQuestion = entry.type.includes("question");
              const isGuess = entry.type.includes("guess");

              return (
                <div
                  key={entry.id}
                  className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg"
                  data-testid={`history-entry-${entry.id}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPlayer ? "bg-primary" : isGuess ? "bg-orange-500" : "bg-accent"
                    }`}
                  >
                    {isPlayer ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">
                      {isPlayer ? "You" : "AI"} {isQuestion ? "asked" : isGuess ? "guessed" : "responded"}:{" "}
                      "{entry.content}"
                    </p>
                    {entry.response && (
                      <Badge
                        variant={entry.response.toLowerCase() === "yes" ? "default" : "destructive"}
                        className="mt-1 text-xs"
                      >
                        Answer: {entry.response}
                      </Badge>
                    )}
                    {isGuess && (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs"
                      >
                        Final Guess
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
