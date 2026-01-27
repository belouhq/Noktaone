import { MicroAction, Instruction } from "./types";
import { hapticV1, HapticBreathingGuide } from "./hapticsV1";

/**
 * MICRO-ACTION RUNNER V1
 *
 * Guidage haptique prioritaire.
 *
 * PRINCIPES :
 * 1. Haptique = guide principal
 * 2. Visuel = support optionnel
 * 3. Durée adaptative (20-30s)
 * 4. Fin = vibration signature + silence
 */

export interface PhaseStateV1 {
  instruction: string;
  type: "inhale" | "exhale" | "hold" | "action" | "pause";
  secondsRemaining: number;
  totalSeconds: number;
  currentCycle: number;
  totalCycles: number;
  isComplete: boolean;
  phaseProgress: number; // 0-1 pour animations fluides
  isLastCycle: boolean;
}

export type PhaseCallbackV1 = (state: PhaseStateV1) => void;

export class MicroActionRunnerV1 {
  private action: MicroAction;
  private onPhaseUpdate: PhaseCallbackV1;
  private onComplete: () => void;

  private currentCycle = 0;
  private currentInstructionIndex = 0;
  private secondsRemaining = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private hapticGuide: HapticBreathingGuide;

  constructor(
    action: MicroAction,
    onPhaseUpdate: PhaseCallbackV1,
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

    hapticV1.transition();

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

    this.hapticGuide.startPhase(instruction.type, instruction.duration);

    this.emitState(instruction);

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
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.hapticGuide.stopPhase();

    this.currentInstructionIndex++;

    if (this.currentInstructionIndex >= this.action.instructions.length) {
      this.currentInstructionIndex = 0;
      this.currentCycle++;

      this.hapticGuide.endCycle();

      if (this.currentCycle >= this.action.repetitions) {
        this.complete();
        return;
      }

      setTimeout(() => {
        if (this.isRunning) {
          this.startInstruction();
        }
      }, 200);
      return;
    }

    this.startInstruction();
  }

  private complete(): void {
    this.isRunning = false;

    this.hapticGuide.complete();

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

export default MicroActionRunnerV1;
