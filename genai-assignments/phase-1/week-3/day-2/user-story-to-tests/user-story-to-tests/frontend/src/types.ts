export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
  includeTestcases?: boolean
  includeFeatureFile?: boolean
  mode?: 'manual' | 'jira'
  jiraBaseUrl?: string
  jiraApiKey?: string
  jiraEmail?: string
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
  featureFile?: string
}