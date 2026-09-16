import { HUD } from './HUD';
import { DialogueOverlay } from './DialogueOverlay';
import { TriviaOverlay } from './TriviaOverlay';

export const GameUI = () => {
  return (
    <>
      <HUD />
      <DialogueOverlay />
      <TriviaOverlay />
    </>
  );
};
