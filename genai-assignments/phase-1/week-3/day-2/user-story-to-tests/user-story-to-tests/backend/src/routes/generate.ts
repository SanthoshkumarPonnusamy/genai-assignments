import express from 'express'
import fetch from 'node-fetch'
import { GroqClient } from '../llm/groqClient'
import { GenerateRequestSchema, GenerateResponseSchema, GenerateResponse } from '../schemas'
import { SYSTEM_PROMPT, buildPrompt, SYSTEM_PROMPT_FEATURE, buildFeaturePrompt } from '../prompt'

export const generateRouter = express.Router()

async function flattenJiraDescription(description: any): Promise<string> {
  if (!description) return ''

  if (typeof description === 'string') {
    return description
  }

  if (description.type === 'doc' && Array.isArray(description.content)) {
    const textParts: string[] = []
    const walk = (node: any) => {
      if (typeof node === 'string') {
        textParts.push(node)
        return
      }
      if (Array.isArray(node.content)) {
        node.content.forEach(walk)
      }
      if (node.text) {
        textParts.push(node.text)
      }
      if (node.type === 'paragraph' || node.type === 'heading') {
        textParts.push('\n')
      }
    }
    walk(description)
    return textParts.join('').trim()
  }

  return String(description)
}

function extractAcceptanceCriteria(text: string): string {
  if (!text) return ''

  const normalized = text.replace(/\r\n/g, '\n')
  const match = normalized.match(/(Acceptance Criteria[:\s]*\n?[\s\S]*)/i)
  if (match) {
    return match[1].trim()
  }

  return text.trim()
}

async function fetchJiraStoryDetails(request: any): Promise<any> {
  const jiraBaseUrl = request.jiraBaseUrl?.replace(/\/+$/, '')
  const jiraApiKey = request.jiraApiKey
  const jiraEmail = request.jiraEmail

  if (!jiraBaseUrl || !jiraApiKey || !jiraEmail) {
    throw new Error('Incomplete Jira credentials')
  }

  const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraApiKey}`).toString('base64')}`
  const searchUrl = `${jiraBaseUrl}/rest/api/3/search/jql`
  const searchBody = {
    jql: 'issuetype = Story ORDER BY updated DESC',
    maxResults: 1,
    fields: ['summary', 'description', 'project']
  }

  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchBody)
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Jira API request failed: ${response.status} ${response.statusText} ${errorBody}`)
  }

  const data: any = await response.json()
  const issue = data.issues?.[0]
  if (!issue) {
    throw new Error('No Jira story found for the provided credentials')
  }

  const summary = issue.fields?.summary || 'Jira Story'
  const rawDescription = issue.fields?.description
  const description = await flattenJiraDescription(rawDescription)
  let acceptanceCriteria = extractAcceptanceCriteria(description)

  if (!acceptanceCriteria) {
    acceptanceCriteria = `Use the Jira issue description and summary to infer acceptance criteria.`
  }

  const additionalInfo = `Jira issue key: ${issue.key}${issue.fields?.project?.key ? `\nProject: ${issue.fields.project.key}` : ''}`

  return {
    ...request,
    storyTitle: summary,
    description,
    acceptanceCriteria,
    additionalInfo
  }
}

generateRouter.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = GenerateRequestSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const validatedRequest = validationResult.data
    let request = validatedRequest

    // If Jira mode is selected, fetch the latest Jira story and enrich the request with its details
    if (validatedRequest.mode === 'jira') {
      try {
        request = await fetchJiraStoryDetails(validatedRequest)
      } catch (jiraError) {
        console.error('Jira fetch error:', jiraError)
        res.status(502).json({ error: jiraError instanceof Error ? jiraError.message : 'Failed to read Jira story' })
        return
      }
    }

    // Determine requested outputs
    const includeTestcases = request.includeTestcases ?? true
    const includeFeatureFile = request.includeFeatureFile ?? false

    // Build prompts
    const userPrompt = buildPrompt(request)
    const featurePrompt = buildFeaturePrompt(request)

    // Create GroqClient instance here to ensure env vars are loaded
    const groqClient = new GroqClient()

    try {
      if (includeTestcases && includeFeatureFile) {
        // Run both in parallel
        const [testsResp, featureResp] = await Promise.all([
          groqClient.generateTests(SYSTEM_PROMPT, userPrompt),
          groqClient.generateFeatureFile(SYSTEM_PROMPT_FEATURE, featurePrompt)
        ])

        // Parse tests JSON
        let parsedResponse: GenerateResponse
        try {
          parsedResponse = JSON.parse(testsResp.content)
        } catch (parseError) {
          res.status(502).json({ error: 'LLM returned invalid JSON format for testcases' })
          return
        }

        const responseValidation = GenerateResponseSchema.safeParse(parsedResponse)
        if (!responseValidation.success) {
          res.status(502).json({ error: 'LLM response does not match expected schema for testcases' })
          return
        }

        // Combine results
        const finalResponse = {
          ...responseValidation.data,
          featureFile: featureResp.content,
          model: `${testsResp.model || ''}${featureResp.model ? '|' + featureResp.model : ''}`,
          promptTokens: (testsResp.promptTokens || 0) + (featureResp.promptTokens || 0),
          completionTokens: (testsResp.completionTokens || 0) + (featureResp.completionTokens || 0)
        }

        res.json(finalResponse)
        return
      }

      if (includeFeatureFile && !includeTestcases) {
        // Only feature file requested
        const featureResp = await groqClient.generateFeatureFile(SYSTEM_PROMPT_FEATURE, featurePrompt)
        res.json({ cases: [], featureFile: featureResp.content, model: featureResp.model, promptTokens: featureResp.promptTokens, completionTokens: featureResp.completionTokens })
        return
      }

      // Default: only testcases (existing flow)
      const groqResponse = await groqClient.generateTests(SYSTEM_PROMPT, userPrompt)

      // Parse the JSON content
      let parsedResponse: GenerateResponse
      try {
        parsedResponse = JSON.parse(groqResponse.content)
      } catch (parseError) {
        res.status(502).json({
          error: 'LLM returned invalid JSON format'
        })
        return
      }

      // Validate the response schema
      const responseValidation = GenerateResponseSchema.safeParse(parsedResponse)
      if (!responseValidation.success) {
        res.status(502).json({
          error: 'LLM response does not match expected schema'
        })
        return
      }

      // Add token usage info if available
      const finalResponse = {
        ...responseValidation.data,
        model: groqResponse.model,
        promptTokens: groqResponse.promptTokens,
        completionTokens: groqResponse.completionTokens
      }

      res.json(finalResponse)
      return
    } catch (llmError) {
      console.error('LLM error:', llmError)
      res.status(502).json({
        error: 'Failed to generate tests/feature file from LLM service'
      })
      return
    }
  } catch (error) {
    console.error('Error in generate route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})