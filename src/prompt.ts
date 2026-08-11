import { EDITORIAL_BRIEF, TYPE_GUIDANCE } from './editorial.js';
import type { CorpusFile } from './corpus.js';
import type { CreateInput, EditInput, ReviewInput } from './types.js';

const ROLE_LABEL: Record<CorpusFile['role'], string> = {
  example: 'voice example',
  avoid: 'counterexample, a style to avoid',
  voice: 'project writing',
};

// The system string is the cache prefix: editorial brief, then project
// instructions, then corpus, and nothing that varies per request.
export function buildSystem(instructions: string, corpus: CorpusFile[]): string {
  const parts = [EDITORIAL_BRIEF];
  if (instructions) {
    parts.push(`# Project instructions\n\n${instructions}`);
  }
  if (corpus.length > 0) {
    const rendered = corpus
      .map((f) => `--- ${f.path} (${ROLE_LABEL[f.role]}) ---\n\n${f.text.trim()}`)
      .join('\n\n');
    parts.push(
      `# Project writing\n\nThe project's own writing follows. Files marked as voice examples or project writing define the voice to match; counterexamples show failure modes to avoid.\n\n${rendered}`
    );
  }
  return parts.join('\n\n');
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}`;
}

function list(title: string, items: string[]): string {
  return section(title, items.map((i) => `- ${i}`).join('\n'));
}

export function buildCreateUser(input: CreateInput): string {
  const head = [`Write a ${input.type}. ${TYPE_GUIDANCE[input.type]}`];
  head.push(`Purpose: ${input.purpose}`);
  if (input.audience) head.push(`Audience: ${input.audience}`);

  const material: string[] = [];
  if (input.context) material.push(section('Context', input.context));
  if (input.current_behavior)
    material.push(section('Current behavior', input.current_behavior));
  if (input.proposed_behavior)
    material.push(section('Proposed behavior', input.proposed_behavior));
  if (input.decisions?.length)
    material.push(list('Decisions made', input.decisions));
  if (input.constraints?.length)
    material.push(list('Constraints', input.constraints));
  if (input.tradeoffs?.length)
    material.push(list('Known tradeoffs', input.tradeoffs));
  if (input.open_questions?.length)
    material.push(list('Open questions', input.open_questions));
  if (input.code_evidence?.length)
    material.push(list('Code evidence', input.code_evidence));
  if (input.notes) material.push(section('Notes', input.notes));

  const parts = [`# Task\n\n${head.join('\n\n')}`];
  if (material.length > 0) {
    parts.push(`# Material\n\n${material.join('\n\n')}`);
  }
  parts.push('Write the document now.');
  return parts.join('\n\n');
}

export function buildEditUser(input: EditInput): string {
  const guidance = input.type ? ` ${TYPE_GUIDANCE[input.type]}` : '';
  return [
    `# Task\n\nEdit the document below.${guidance}`,
    `# Document\n\n${input.document.trim()}`,
    `# Requested changes\n\n${input.changes.trim()}`,
    'Apply the smallest editorially coherent change and return the complete revised document.',
  ].join('\n\n');
}

export function buildReviewUser(input: ReviewInput): string {
  const guidance = input.type ? ` It is a ${input.type}.` : '';
  const parts = [
    `# Task\n\nReview the document below as an editor.${guidance}`,
    `# Document\n\n${input.document.trim()}`,
  ];
  if (input.concerns) {
    parts.push(`# Caller concerns\n\n${input.concerns.trim()}`);
  }
  parts.push('Return your findings.');
  return parts.join('\n\n');
}
