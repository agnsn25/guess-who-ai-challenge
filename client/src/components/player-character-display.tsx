import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Character } from "@/lib/api";

interface PlayerCharacterDisplayProps {
  character: Character;
  title?: string;
}

export function PlayerCharacterDisplay({ character, title = "Your Character" }: PlayerCharacterDisplayProps) {
  return (
    <Card className="p-4 bg-card/60 backdrop-blur-sm">
      <div className="text-center">
        <h3 className="text-sm font-display font-semibold text-foreground mb-3">
          {title}
        </h3>
        <div className="relative inline-block">
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-20 h-20 object-cover rounded-lg mb-2"
            loading="lazy"
          />
          <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
            ✓
          </Badge>
        </div>
        <p className="text-sm text-card-foreground font-medium" data-testid="text-player-character-name">
          {character.name}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          AI is trying to guess this
        </p>
      </div>
    </Card>
  );
}
