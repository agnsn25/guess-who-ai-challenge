import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Character } from "@/lib/api";

interface CharacterSelectionModalProps {
  isOpen: boolean;
  characters: Character[];
  onCharacterSelected: (characterId: string, aiCharacterId: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function CharacterSelectionModal({
  isOpen,
  characters,
  onCharacterSelected,
  onClose,
  isLoading = false,
}: CharacterSelectionModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleStartGame = () => {
    if (!selectedPlayerId || characters.length === 0) return;

    // Randomly select AI character (different from player's choice)
    const availableAiCharacters = characters.filter(c => c.id !== selectedPlayerId);
    const randomAiCharacter = availableAiCharacters[Math.floor(Math.random() * availableAiCharacters.length)];
    
    onCharacterSelected(selectedPlayerId, randomAiCharacter.id);
  };

  const handleClose = () => {
    setSelectedPlayerId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Choose Your Character
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Select a character for the AI to guess. The AI will ask questions to figure out who you chose!
          </p>
        </DialogHeader>

        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 py-4">
          {characters.map((character) => {
            const isSelected = selectedPlayerId === character.id;

            return (
              <div
                key={character.id}
                className={cn(
                  "character-card bg-card rounded-lg p-2 border border-border cursor-pointer relative",
                  isSelected && "ring-2 ring-primary",
                  "hover-elevate"
                )}
                onClick={() => setSelectedPlayerId(character.id)}
                data-testid={`card-select-character-${character.id}`}
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
                {isSelected && (
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

        <div className="flex justify-center space-x-4 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="button-cancel-selection"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartGame}
            disabled={!selectedPlayerId || isLoading}
            data-testid="button-start-game"
          >
            {isLoading ? "Starting Game..." : "Start Game"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
