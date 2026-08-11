import * as z from 'zod';

export const DOC_TYPES = [
  'plan',
  'rfc',
  'design',
  'architecture',
  'readme',
  'guide',
  'explanation',
  'adr',
] as const;

export const createSchema = z.object({
  type: z.enum(DOC_TYPES).describe('Kind of document to write'),
  purpose: z
    .string()
    .describe('What this document must accomplish for its reader'),
  audience: z
    .string()
    .optional()
    .describe('Who reads this and what they already know'),
  context: z
    .string()
    .optional()
    .describe('Background facts from your investigation, as prose or notes'),
  current_behavior: z
    .string()
    .optional()
    .describe('How the system behaves today'),
  proposed_behavior: z
    .string()
    .optional()
    .describe('How it should behave after the change'),
  decisions: z
    .array(z.string())
    .optional()
    .describe('Decisions already made, with their reasons if known'),
  constraints: z
    .array(z.string())
    .optional()
    .describe('Hard constraints the document must respect'),
  tradeoffs: z
    .array(z.string())
    .optional()
    .describe('Known costs of the chosen approach'),
  open_questions: z
    .array(z.string())
    .optional()
    .describe('What remains genuinely unresolved'),
  code_evidence: z
    .array(z.string())
    .optional()
    .describe('File paths, signatures, or snippets the document may cite'),
  notes: z
    .string()
    .optional()
    .describe('Any other factual material that fits no field above'),
});

export const editSchema = z.object({
  document: z.string().describe('The current document text, verbatim'),
  changes: z
    .string()
    .describe(
      'What must change, stated as facts (what is wrong, what is now true), not as replacement prose'
    ),
  type: z.enum(DOC_TYPES).optional().describe('Kind of document, if known'),
});

export const reviewSchema = z.object({
  document: z.string().describe('The document text to review, verbatim'),
  type: z.enum(DOC_TYPES).optional().describe('Kind of document, if known'),
  concerns: z
    .string()
    .optional()
    .describe('Specific things you want the review to weigh'),
});

export type CreateInput = z.infer<typeof createSchema>;
export type EditInput = z.infer<typeof editSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
