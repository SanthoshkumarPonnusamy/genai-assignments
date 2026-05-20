import { z } from 'zod'

export const GenerateRequestSchema = z.object({
  mode: z.enum(['manual', 'jira']).optional().default('manual'),
  storyTitle: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  description: z.string().optional(),
  additionalInfo: z.string().optional(),
  jiraBaseUrl: z.string().optional(),
  jiraApiKey: z.string().optional(),
  jiraEmail: z.string().optional(),
  includeTestcases: z.boolean().optional().default(true),
  includeFeatureFile: z.boolean().optional().default(false)
}).superRefine((data, ctx) => {
  if (data.mode === 'manual') {
    if (!data.storyTitle?.trim()) {
      ctx.addIssue({ path: ['storyTitle'], message: 'Story title is required for manual mode' })
    }
    if (!data.acceptanceCriteria?.trim()) {
      ctx.addIssue({ path: ['acceptanceCriteria'], message: 'Acceptance criteria is required for manual mode' })
    }
  }

  if (data.mode === 'jira') {
    if (!data.jiraBaseUrl?.trim()) {
      ctx.addIssue({ path: ['jiraBaseUrl'], message: 'Jira Base URL is required for Jira mode' })
    }
    if (!data.jiraApiKey?.trim()) {
      ctx.addIssue({ path: ['jiraApiKey'], message: 'Jira API Key is required for Jira mode' })
    }
    if (!data.jiraEmail?.trim()) {
      ctx.addIssue({ path: ['jiraEmail'], message: 'Jira Email is required for Jira mode' })
    }
  }
})

export const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
  testData: z.string().optional(),
  expectedResult: z.string(),
  category: z.string()
})

export const GenerateResponseSchema = z.object({
  cases: z.array(TestCaseSchema).optional(),
  model: z.string().optional(),
  promptTokens: z.number(),
  completionTokens: z.number()
  ,featureFile: z.string().optional()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>