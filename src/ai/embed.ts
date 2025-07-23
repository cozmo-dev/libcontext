import { openai } from '@libcontext/ai/openai';

export const embed = async (input: string): Promise<number[]> => {
  if (!input?.trim()) {
    throw new Error('Input cannot be empty');
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: input,
  });
  const [embedding] = response.data.map((item) => item.embedding);
  return embedding;
};
