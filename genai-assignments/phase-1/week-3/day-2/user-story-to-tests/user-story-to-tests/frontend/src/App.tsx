import { useState } from 'react'
import { generateTests } from './api'
import { GenerateRequest, GenerateResponse, TestCase } from './types'

function App() {
  const [formData, setFormData] = useState<GenerateRequest>({
    storyTitle: '',
    acceptanceCriteria: '',
    description: '',
    additionalInfo: ''
  })
  const [mode, setMode] = useState<'manual' | 'jira'>('manual')
  const [jiraData, setJiraData] = useState({
    jiraBaseUrl: '',
    jiraApiKey: '',
    jiraEmail: ''
  })
  const [results, setResults] = useState<GenerateResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedTestCases, setExpandedTestCases] = useState<Set<string>>(new Set())
  const [includeTestcases, setIncludeTestcases] = useState<boolean>(true)
  const [includeFeatureFile, setIncludeFeatureFile] = useState<boolean>(false)

  const toggleTestCaseExpansion = (testCaseId: string) => {
    const newExpanded = new Set(expandedTestCases)
    if (newExpanded.has(testCaseId)) {
      newExpanded.delete(testCaseId)
    } else {
      newExpanded.add(testCaseId)
    }
    setExpandedTestCases(newExpanded)
  }

  const handleInputChange = (field: keyof GenerateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleJiraInputChange = (field: keyof typeof jiraData, value: string) => {
    setJiraData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'manual') {
      if (!formData.storyTitle.trim() || !formData.acceptanceCriteria.trim()) {
        setError('Story Title and Acceptance Criteria are required')
        return
      }
    } else {
      if (
        !jiraData.jiraBaseUrl.trim() ||
        !jiraData.jiraApiKey.trim() ||
        !jiraData.jiraEmail.trim()
      ) {
        setError('Jira Base URL, Jira API Key, and Jira Email are all required')
        return
      }
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const request: GenerateRequest = {
        ...formData,
        includeTestcases,
        includeFeatureFile,
        mode,
        jiraBaseUrl: jiraData.jiraBaseUrl,
        jiraApiKey: jiraData.jiraApiKey,
        jiraEmail: jiraData.jiraEmail
      }

      const response = await generateTests(request)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests')
    } finally {
      setIsLoading(false)
    }
  }

  const getLoadingMessage = () => {
    if (includeTestcases && includeFeatureFile) {
      return 'Generating test cases and feature file...'
    }
    if (includeFeatureFile) {
      return 'Generating feature file...'
    }
    return 'Generating test cases...'
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 90%;
            padding: 30px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 85%;
            padding: 40px;
          }
        }
        
        @media (min-width: 1440px) {
          .container {
            max-width: 1800px;
            padding: 50px;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .title {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .form-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }

        .radio-group {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 10px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #2c3e50;
          cursor: pointer;
        }

        .radio-input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .submit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #2980b9;
        }
        
        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
        
        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }
        
        .results-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e8ed;
        }
        
        .results-title {
          font-size: 1.8rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .results-meta {
          color: #666;
          font-size: 14px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        .results-table th,
        .results-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }
        
        .results-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .results-table tr:hover {
          background: #f8f9fa;
        }
        
        .category-positive { color: #27ae60; font-weight: 600; }
        .category-negative { color: #e74c3c; font-weight: 600; }
        .category-edge { color: #f39c12; font-weight: 600; }
        .category-authorization { color: #9b59b6; font-weight: 600; }
        .category-non-functional { color: #34495e; font-weight: 600; }
        
        .test-case-id {
          cursor: pointer;
          color: #3498db;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .test-case-id:hover {
          background: #f8f9fa;
        }
        
        .test-case-id.expanded {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .expand-icon {
          font-size: 10px;
          transition: transform 0.2s;
        }
        
        .expand-icon.expanded {
          transform: rotate(90deg);
        }
        
        .expanded-details {
          margin-top: 15px;
          background: #fafbfc;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          padding: 20px;
        }
        
        .step-item {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .step-header {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          align-items: start;
        }
        
        .step-id {
          font-weight: 600;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
        }
        
        .step-description {
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .step-test-data {
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .step-expected {
          color: #27ae60;
          font-weight: 500;
          font-size: 14px;
        }
        
        .step-labels {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
          font-weight: 600;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
      
      <div className="container">
        <div className="header">
          <h1 className="title">User Story to Tests</h1>
          <p className="subtitle">Generate comprehensive test cases from your user stories</p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">Mode of Input</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  className="radio-input"
                  name="inputMode"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={() => {
                    setMode('manual')
                    setError(null)
                  }}
                />
                Manual Input
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  className="radio-input"
                  name="inputMode"
                  value="jira"
                  checked={mode === 'jira'}
                  onChange={() => {
                    setMode('jira')
                    setError(null)
                  }}
                />
                Connect to Jira
              </label>
            </div>
          </div>

          {mode === 'manual' ? (
            <>
              <div className="form-group">
                <label htmlFor="storyTitle" className="form-label">
                  Story Title *
                </label>
                <input
                  type="text"
                  id="storyTitle"
                  className="form-input"
                  value={formData.storyTitle}
                  onChange={(e) => handleInputChange('storyTitle', e.target.value)}
                  placeholder="Enter the user story title..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional description (optional)..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="acceptanceCriteria" className="form-label">
                  Acceptance Criteria *
                </label>
                <textarea
                  id="acceptanceCriteria"
                  className="form-textarea"
                  value={formData.acceptanceCriteria}
                  onChange={(e) => handleInputChange('acceptanceCriteria', e.target.value)}
                  placeholder="Enter the acceptance criteria..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="additionalInfo" className="form-label">
                  Additional Info
                </label>
                <textarea
                  id="additionalInfo"
                  className="form-textarea"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any additional information (optional)..."
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="jiraBaseUrl" className="form-label">
                  Jira Base URL *
                </label>
                <input
                  type="text"
                  id="jiraBaseUrl"
                  className="form-input"
                  value={jiraData.jiraBaseUrl}
                  onChange={(e) => handleJiraInputChange('jiraBaseUrl', e.target.value)}
                  placeholder="https://your-domain.atlassian.net"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jiraApiKey" className="form-label">
                  Jira API Key *
                </label>
                <input
                  type="password"
                  id="jiraApiKey"
                  className="form-input"
                  value={jiraData.jiraApiKey}
                  onChange={(e) => handleJiraInputChange('jiraApiKey', e.target.value)}
                  placeholder="Enter your Jira API key"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="jiraEmail" className="form-label">
                  Jira Email *
                </label>
                <input
                  type="email"
                  id="jiraEmail"
                  className="form-input"
                  value={jiraData.jiraEmail}
                  onChange={(e) => handleJiraInputChange('jiraEmail', e.target.value)}
                  placeholder="Enter your Jira account email"
                  required
                />
              </div>
            </>
          )}

          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <input
                type="checkbox"
                checked={includeTestcases}
                onChange={() => setIncludeTestcases(v => !v)}
              />
              Testcases
            </label>

            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <input
                type="checkbox"
                checked={includeFeatureFile}
                onChange={() => setIncludeFeatureFile(v => !v)}
              />
              Feature File
            </label>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="loading">
            {getLoadingMessage()}
          </div>
        )}

        {results && (
          <div className="results-container">
            {results.cases && results.cases.length > 0 && (
              <>
                <div className="results-header">
                  <h2 className="results-title">Generated Test Cases</h2>
                  <div className="results-meta">
                    {results.cases.length} test case(s) generated
                    {results.model && ` • Model: ${results.model}`}
                    {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
                  </div>
                </div>
                
                <div className="table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Test Case ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Expected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.cases.map((testCase: TestCase) => (
                        <>
                          <tr key={testCase.id}>
                            <td>
                              <div 
                                className={`test-case-id ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}
                                onClick={() => toggleTestCaseExpansion(testCase.id)}
                              >
                                <span className={`expand-icon ${expandedTestCases.has(testCase.id) ? 'expanded' : ''}`}>
                                  ▶
                                </span>
                                {testCase.id}
                              </div>
                            </td>
                            <td>{testCase.title}</td>
                            <td>
                              <span className={`category-${testCase.category.toLowerCase()}`}>
                                {testCase.category}
                              </span>
                            </td>
                            <td>{testCase.expectedResult}</td>
                          </tr>
                          {expandedTestCases.has(testCase.id) && (
                            <tr key={`${testCase.id}-details`}>
                              <td colSpan={4}>
                                <div className="expanded-details">
                                  <h4 style={{marginBottom: '15px', color: '#2c3e50'}}>Test Steps for {testCase.id}</h4>
                                  <div className="step-labels">
                                    <div>Step ID</div>
                                    <div>Step Description</div>
                                    <div>Test Data</div>
                                    <div>Expected Result</div>
                                  </div>
                                  {testCase.steps.map((step, index) => (
                                    <div key={index} className="step-item">
                                      <div className="step-header">
                                        <div className="step-id">S{String(index + 1).padStart(2, '0')}</div>
                                        <div className="step-description">{step}</div>
                                        <div className="step-test-data">{testCase.testData || 'N/A'}</div>
                                        <div className="step-expected">
                                          {index === testCase.steps.length - 1 ? testCase.expectedResult : 'Step completed successfully'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {results.featureFile && (
              <div style={{marginTop: results.cases && results.cases.length > 0 ? '30px' : '0'}}>
                <div className="results-header">
                  <h2 className="results-title">Generated Feature File</h2>
                  <div className="results-meta">
                    {results.model && `Model: ${results.model}`}
                    {results.promptTokens > 0 && ` • Tokens: ${results.promptTokens + results.completionTokens}`}
                  </div>
                </div>
                <div style={{
                  background: '#f5f5f5',
                  border: '1px solid #e1e8ed',
                  borderRadius: '6px',
                  padding: '20px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#2c3e50'
                }}>
                  {results.featureFile}
                </div>
              </div>
            )}

            {(!results.cases || results.cases.length === 0) && !results.featureFile && (
              <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                <p>No test cases or feature file generated.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App