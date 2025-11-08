// Declarative scene description and constants for PBFT phases.

export type Phase = 'pre-prepare' | 'prepare' | 'commit';

export type MessageKind = 'pre-prepare' | 'prepare' | 'commit';

export type Message = {
  id: string;
  from: number; // node index
  to: number;   // node index
  kind: MessageKind;
  payload: string;
  conflicting?: boolean;
};

export type SceneStep = {
  atMs: number; // when the step becomes due on the timeline
  messages: Message[];
  narration?: string; // text to show in the explanation box
};

export type Scene = {
  phase: Phase;
  steps: SceneStep[];
};

// Base parameters for a 4-node system with f=1 (n = 3f + 1)
export const NODES = 4;
export const F = 1; // (n - 1) / 3

// Spacing between steps (ms). Aligned with SVG animation duration so one step's
// arrows finish drawing before the next one starts.
export const STEP_MS = 1200;

// Pre-prepare phase script (leader proposes a value)
export const prePrepareScene: Scene = {
  phase: 'pre-prepare',
  steps: [
    {
      atMs: 0,
      narration: 'Leader proposes a value v with sequence number and view, broadcasting PRE-PREPARE.',
      messages: [
        { id: 'pp-1', from: 0, to: 1, kind: 'pre-prepare', payload: 'v' },
        { id: 'pp-2', from: 0, to: 2, kind: 'pre-prepare', payload: 'v' },
        { id: 'pp-3', from: 0, to: 3, kind: 'pre-prepare', payload: 'v' },
      ],
    },
    {
      atMs: STEP_MS,
      narration: 'Replicas validate PRE-PREPARE (correct view, sequence, digest) and become READY to send PREPARE.',
      messages: [],
    },
  ],
};

// Prepare phase script (replicas broadcast PREPARE to all). Only scaffolded here.
export const prepareScene: Scene = {
  phase: 'prepare',
  steps: [
    {
      atMs: 0,
      narration: 'Replica n1 broadcasts PREPARE for v to all nodes.',
      messages: [
        { id: 'pr-1', from: 1, to: 0, kind: 'prepare', payload: 'v' },
        { id: 'pr-2', from: 1, to: 2, kind: 'prepare', payload: 'v' },
        { id: 'pr-3', from: 1, to: 3, kind: 'prepare', payload: 'v' },
      ],
    },
    {
      atMs: STEP_MS,
      narration: 'Replica n2 broadcasts PREPARE for v to all nodes.',
      messages: [
        { id: 'pr-4', from: 2, to: 0, kind: 'prepare', payload: 'v' },
        { id: 'pr-5', from: 2, to: 1, kind: 'prepare', payload: 'v' },
        { id: 'pr-6', from: 2, to: 3, kind: 'prepare', payload: 'v' },
      ],
    },
    {
      atMs: STEP_MS * 2,
      narration: 'Replica n3 broadcasts PREPARE for v to all nodes. Replicas collect 2f + 1 matching PREPARE messages.',
      messages: [
        { id: 'pr-7', from: 3, to: 0, kind: 'prepare', payload: 'v' },
        { id: 'pr-8', from: 3, to: 1, kind: 'prepare', payload: 'v' },
        { id: 'pr-9', from: 3, to: 2, kind: 'prepare', payload: 'v' },
      ],
    },
    {
      atMs: STEP_MS * 3,
      narration: 'Condition met (2f + 1 PREPARE). System is ready to enter COMMIT phase.',
      messages: [],
    },
  ],
};

// Commit phase script (upon 2f + 1 PREPARE, broadcast COMMIT). Only scaffolded here.
export const commitScene: Scene = {
  phase: 'commit',
  steps: [
    {
      atMs: 0,
      narration: 'Upon collecting 2f + 1 PREPARE for v, replicas broadcast COMMIT to all.',
      messages: [
        { id: 'cm-1', from: 0, to: 1, kind: 'commit', payload: 'v' },
        { id: 'cm-2', from: 0, to: 2, kind: 'commit', payload: 'v' },
        { id: 'cm-3', from: 0, to: 3, kind: 'commit', payload: 'v' },
      ],
    },
    {
      atMs: STEP_MS,
      narration: 'Replicas collect 2f + 1 COMMIT messages, locally executing value v (decision).',
      messages: [],
    },
    {
      atMs: STEP_MS * 2,
      narration: 'Consensus achieved for value v. Protocol round complete.',
      messages: [],
    },
  ],
};