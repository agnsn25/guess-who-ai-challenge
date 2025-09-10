import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";

interface QuestionInputProps {
  onAskQuestion: (question: string) => void;
  isAskingAI: boolean;
  disabled?: boolean;
}

const quickQuestions = [
  "Wears glasses?",
  "Has long hair?",
  "Facial hair?",
  "Young person?",
  "Brown hair?",
  "Smiling?",
];

export function QuestionInput({ onAskQuestion, isAskingAI, disabled }: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;
    
    onAskQuestion(trimmedQuestion);
    setQuestion("");
  };

  const handleQuickQuestion = (quickQ: string) => {
    setQuestion(`Does this person ${quickQ.toLowerCase()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">
        Ask Your Question
      </h3>

      <div className="space-y-4">
        <div>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            className="resize-none"
            rows={3}
            placeholder="Type your question here... (e.g., 'Does this person wear glasses?')"
            disabled={disabled || isAskingAI}
            data-testid="input-player-question"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((quickQ) => (
              <Badge
                key={quickQ}
                variant="secondary"
                className="cursor-pointer hover:bg-muted/80"
                onClick={() => handleQuickQuestion(quickQ)}
                data-testid={`badge-quick-question-${quickQ.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
              >
                {quickQ}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!question.trim() || isAskingAI || disabled}
          className="w-full"
          data-testid="button-ask-question"
        >
          <Send className="h-4 w-4 mr-2" />
          {isAskingAI ? "Asking AI..." : "Ask Question"}
        </Button>
      </div>
    </Card>
  );
}
