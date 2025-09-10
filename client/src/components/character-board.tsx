import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Character } from "@/lib/api";

interface CharacterBoardProps {
  characters: Character[];
  eliminatedCharacters: string[];
  selectedCharacterIds: Set<string>;
  onCharacterClick: (characterId: string) => void;
  onEliminateSelected: () => void;
  isEliminatingCharacters: boolean;
}

export function CharacterBoard({
  characters,
  eliminatedCharacters,
  selectedCharacterIds,
  onCharacterClick,
  onEliminateSelected,
  isEliminatingCharacters,
}: CharacterBoardProps) {
  const remainingCount = characters.length - eliminatedCharacters.length;

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-foreground">
          Character Board
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span data-testid="text-remaining-characters">{remainingCount}</span>
            <span>characters remaining</span>
          </div>
          {selectedCharacterIds.size > 0 && (
            <Button
              onClick={onEliminateSelected}
              disabled={isEliminatingCharacters}
              size="sm"
              variant="destructive"
              data-testid="button-eliminate-selected"
            >
              Eliminate Selected ({selectedCharacterIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        {characters.map((character) => {
          const isEliminated = eliminatedCharacters.includes(character.id);
          const isSelected = selectedCharacterIds.has(character.id);

          return (
            <div
              key={character.id}
              className={cn(
                "character-card bg-card rounded-lg p-2 border border-border cursor-pointer relative",
                isEliminated && "eliminated pointer-events-none",
                isSelected && !isEliminated && "ring-2 ring-primary",
                !isEliminated && "hover-elevate"
              )}
              onClick={() => !isEliminated && onCharacterClick(character.id)}
              data-testid={`card-character-${character.id}`}
            >
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full aspect-square object-cover rounded-md mb-2"
                loading="lazy"
              />
              <p className="text-xs text-center text-card-foreground font-medium">
                {character.name}
              </p>
              {isSelected && !isEliminated && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  ✓
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
