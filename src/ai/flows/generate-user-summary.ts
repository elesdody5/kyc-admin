'use server';

/**
 * @fileOverview A flow to generate a summary of a user's information for admin review.
 *
 * - generateUserSummary - A function that generates the user summary.
 * - GenerateUserSummaryInput - The input type for the generateUserSummary function.
 * - GenerateUserSummaryOutput - The return type for the generateUserSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUserSummaryInputSchema = z.object({
  name: z.string().describe('The name of the user.'),
  id: z.string().describe('The unique identifier of the user.'),
  database: z.string().describe('The database the user is stored in.'),
  image: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateUserSummaryInput = z.infer<typeof GenerateUserSummaryInputSchema>;

const GenerateUserSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the user.'),
});
export type GenerateUserSummaryOutput = z.infer<typeof GenerateUserSummaryOutputSchema>;

export async function generateUserSummary(input: GenerateUserSummaryInput): Promise<GenerateUserSummaryOutput> {
  return generateUserSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUserSummaryPrompt',
  input: {schema: GenerateUserSummaryInputSchema},
  output: {schema: GenerateUserSummaryOutputSchema},
  prompt: `You are an AI assistant helping an admin review user profiles.

  Given the following information about a user, generate a concise summary to help the admin quickly understand the user's profile.

  Name: {{{name}}}
  ID: {{{id}}}
  Database: {{{database}}}
  Image: {{media url=image}}
  `,
});

const generateUserSummaryFlow = ai.defineFlow(
  {
    name: 'generateUserSummaryFlow',
    inputSchema: GenerateUserSummaryInputSchema,
    outputSchema: GenerateUserSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
