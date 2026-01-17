import { MicroAction, Instruction } from './types';
import { haptic } from './haptics';

export interface PhaseState {
  instruction: string;
  type: 'inhale' | 'exhale' | 'hold' | 'action' | 'pause';
  secondsRemaining: number;
  totalSeconds: number;
  currentCycle: number;
  totalCycles: number;
  isComplete: boolean;
}

export type PhaseCallback = (state: PhaseState) => void;

export class MicroActionRunner {
  private action: MicroAction;
  private onPhaseUpdate: PhaseCallback;
  private onComplete: () => void;
  
  private currentCycle = 0;
  private currentInstructionIndex = 0;
  private secondsRemaining = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    action: MicroAction,
    onPhaseUpdate: PhaseCallback,
    onComplete: () => void
  ) {
    this.action = action;
    this.onPhaseUpdate = onPhaseUpdate;
    this.onComplete = onComplete;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentCycle = 0;
    this.currentInstructionIndex = 0;
    
    haptic.transition(); // Début de l'action
    this.startInstruction();
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startInstruction(): void {
    const instruction = this.action.instructions[this.currentInstructionIndex];
    this.secondsRemaining = instruction.duration;
    
    haptic.transition(); // Début de phase
    this.emitState(instruction);
    
    this.intervalId = setInterval(() => {
      this.secondsRemaining--;
      
      if (this.secondsRemaining > 0) {
        // Vibration seulement pour les phases de respiration, pas pour pause
        if (instruction.type !== 'pause') {
          haptic.tick();
        }
        this.emitState(instruction);
      } else {
        this.nextPhase();
      }
    }, 1000);
  }

  private nextPhase(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.currentInstructionIndex++;

    // Fin des instructions de ce cycle ?
    if (this.currentInstructionIndex >= this.action.instructions.length) {
      this.currentInstructionIndex = 0;
      this.currentCycle++;
      
      haptic.long(); // Fin de cycle

      // Fin de tous les cycles ?
      if (this.currentCycle >= this.action.repetitions) {
        this.complete();
        return;
      }
    }

    // Continuer avec la prochaine instruction
    this.startInstruction();
  }

  private complete(): void {
    this.isRunning = false;
    haptic.end(); // Double vibration fin
    
    this.onPhaseUpdate({
      instruction: '',
      type: 'action',
      secondsRemaining: 0,
      totalSeconds: 0,
      currentCycle: this.action.repetitions,
      totalCycles: this.action.repetitions,
      isComplete: true,
    });
    
    // Petit délai avant le callback
    setTimeout(() => {
      this.onComplete();
    }, 500);
  }

  private emitState(instruction: Instruction): void {
    this.onPhaseUpdate({
      instruction: instruction.text,
      type: instruction.type,
      secondsRemaining: this.secondsRemaining,
      totalSeconds: instruction.duration,
      currentCycle: this.currentCycle + 1,
      totalCycles: this.action.repetitions,
      isComplete: false,
    });
  }
}
