import { MicroAction, Instruction } from "./types";
import { hapticV2, HapticBreathingGuide } from "./hapticsV2";

/**
 * MICRO-ACTION RUNNER V2
 * 
 * Version améliorée avec guidage haptique prioritaire.
 * 
 * PRINCIPES :
 * 1. Haptique = guide principal
 * 2. Visuel = support optionnel
 * 3. Durée adaptative (20-30s)
 * 4. Fin = vibration signature + silence
 */

export interface PhaseStateV2 {
  instruction: string;
  type: "inhale" | "exhale" | "hold" | "action" | "pause";
  secondsRemaining: number;
  totalSeconds: number;
  currentCycle: number;
  totalCycles: number;
  isComplete: boolean;
  // V2 additions
  phaseProgress: number; // 0-1 pour animations fluides
  isLastCycle: boolean;
}

export type PhaseCallbackV2 = (state: PhaseStateV2) => void;

export class MicroActionRunnerV2 {
  private action: MicroAction;
  private onPhaseUpdate: PhaseCallbackV2;
  private onComplete: () => void;

  private currentCycle = 0;
  private currentInstructionIndex = 0;
  private secondsRemaining = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // V2: Guide haptique
  private hapticGuide: HapticBreathingGuide;

  constructor(
    action: MicroAction,
    onPhaseUpdate: PhaseCallbackV2,
    onComplete: () => void
  ) {
    this.action = action;
    this.onPhaseUpdate = onPhaseUpdate;
    this.onComplete = onComplete;
    this.hapticGuide = new HapticBreathingGuide();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.currentCycle = 0;
    this.currentInstructionIndex = 0;

    // Vibration de transition (début de l'action)
    hapticV2.transition();

    // Court délai avant de commencer (laisser la transition se faire)
    setTimeout(() => {
      this.startInstruction();
    }, 300);
  }

  stop(): void {
    this.isRunning = false;
    this.hapticGuide.stopPhase();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startInstruction(): void {
    const instruction = this.action.instructions[this.currentInstructionIndex];
    this.secondsRemaining = instruction.duration;

    // V2: Démarrer le guidage haptique pour cette phase
    this.hapticGuide.startPhase(instruction.type, instruction.duration);

    // Émettre l'état initial
    this.emitState(instruction);

    // Timer par seconde
    this.intervalId = setInterval(() => {
      this.secondsRemaining--;

      if (this.secondsRemaining > 0) {
        this.emitState(instruction);
      } else {
        this.nextPhase();
      }
    }, 1000);
  }

  private nextPhase(): void {
    // Arrêter le timer et l'haptique de la phase précédente
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.hapticGuide.stopPhase();

    this.currentInstructionIndex++;

    // Fin des instructions de ce cycle ?
    if (this.currentInstructionIndex >= this.action.instructions.length) {
      this.currentInstructionIndex = 0;
      this.currentCycle++;

      // V2: Vibration de fin de cycle
      this.hapticGuide.endCycle();

      // Fin de tous les cycles ?
      if (this.currentCycle >= this.action.repetitions) {
        this.complete();
        return;
      }

      // Petit délai entre cycles
      setTimeout(() => {
        if (this.isRunning) {
          this.startInstruction();
        }
      }, 200);
      return;
    }

    // Continuer avec la prochaine instruction
    this.startInstruction();
  }

  private complete(): void {
    this.isRunning = false;

    // V2: Signature haptique de fin (reconnaissable)
    this.hapticGuide.complete();

    // Émettre l'état "complet"
    this.onPhaseUpdate({
      instruction: "",
      type: "action",
      secondsRemaining: 0,
      totalSeconds: 0,
      currentCycle: this.action.repetitions,
      totalCycles: this.action.repetitions,
      isComplete: true,
      phaseProgress: 1,
      isLastCycle: true,
    });

    // Délai avant le callback (moment de silence visuel)
    setTimeout(() => {
      this.onComplete();
    }, 300);
  }

  private emitState(instruction: Instruction): void {
    const totalSeconds = instruction.duration;
    const elapsed = totalSeconds - this.secondsRemaining;
    const phaseProgress = totalSeconds > 0 ? elapsed / totalSeconds : 0;

    this.onPhaseUpdate({
      instruction: instruction.text,
      type: instruction.type,
      secondsRemaining: this.secondsRemaining,
      totalSeconds,
      currentCycle: this.currentCycle + 1,
      totalCycles: this.action.repetitions,
      isComplete: false,
      phaseProgress,
      isLastCycle: this.currentCycle === this.action.repetitions - 1,
    });
  }
}

export default MicroActionRunnerV2;
