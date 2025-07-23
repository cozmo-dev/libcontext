import { openai } from '@libcontext/ai/openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export interface ExtractOptions {
  name: string;
  description: string | null;
  path: string;
  content: string;
}

export const extract = async ({
  name,
  description,
  path,
  content,
}: ExtractOptions) => {
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `You are an expert technical writer. Your job is to create concise, helpful descriptions for code snippets extracted from a library's documentation repo. These pieces of information will be used later to build a \`llms.txt\` file for the library.

For each code snippet you find:
<goal>
- Identify the programming language
- Extract a relevant code snippet to display the functionality
- Create title that describes what the code does
- Write a brief description (2-3 sentences) explaining the code's purpose
- Keep in mind that the title and description you write MUST be helpful for AI IDEs, like Cursor and Windsurf.
</goal>

The titles should:
<title>
- Be descriptive and specific (not generic like "Code Example")
- Be action-oriented when possible (e.g. "Installing Package via CLI", "Rendering Button Component")
- Be under 80 characters
</title>

The descriptions should:
<description>
- Explain what the code does and its purpose
- Mention key components/functions/concepts
- Be helpful for someone searching for similar functionality
- Be 1-2 sentences, under 200 characters
</description>

<guidelines>
- Look for code blocks marked with triple backticks (\`\`\`) or indented code blocks
- Group code snippets by their functionality: be careful to not generate snippets that are too narrow (eg. how to import a component)
- Extract ONLY the core library functionality, stripping away documentation wrapper elements
- Focus on the actual library components being demonstrated, not how they're presented in the docs
- If the file does not contain any code snippets, return an empty list
- It is not necessary to include the library name in the title or description, as it is already known
</guidelines>

<ignore>
You should omit parts of the code that are:
- Documentation layout components
- Storybook wrappers and controls
- Page structure elements (e.g. containers, wrappers purely for documentation display)
- Not relevant to the library's functionality
- Not in a programming language (e.g. plain text or markdown)
- Inline code snippets (single backticks), unless it highlights an important feature
- Import statements for documentation/layout components
</ignore>`,
      },
      {
        role: 'user',
        content: `You are currently analyzing the following library:
<library>
Name: ${name}
Description: ${description || 'No description'}
</library>

Here are the contents of the file to analyze now (${path}):
<file>
${content}
</file>`,
      },
    ],
    response_format: zodResponseFormat(
      z.object({
        snippets: z
          .array(
            z.object({
              title: z
                .string()
                .describe(
                  'An objective title that describes the feature shown.',
                ),
              description: z
                .string()
                .describe(
                  'An explanation of what the code snippet does (2-3 sentences max).',
                ),
              language: z
                .string()
                .describe(
                  'The programming language of the code snippet. Empty string if not applicable.',
                ),
              code: z
                .string()
                .describe('The code snippet extracted from the file.'),
            }),
          )
          .describe('List of code snippets found in the file'),
      }),
      'snippets',
    ),
  });

  const response = completion.choices[0].message.parsed;

  return response?.snippets || [];
};
