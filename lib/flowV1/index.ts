/**
 * FlowV1 - Point d'entrée principal
 * Exporte tous les modules FlowV1
 */

export { FLOW_V1_ENABLED } from './config';
export { FlowOrchestrator, type FlowContext, type FlowState } from './flowOrchestrator';
export { computeBeforeScore, computeAfterScore, computeRawDysregulation } from './scoreEngine';
export { determineInternalState, shouldEnableAmplifier } from './decisionEngine';
export { selectAmplifier, getAmplifierDuration, getAmplifierInstructions } from './amplifierEngine';
export { extractFeaturesFromSignals, generateDefaultFeatures } from './scanFeatures';
export { generateSeed, hashString, clamp } from './utils';
