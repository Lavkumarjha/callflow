import { useState, useEffect } from 'react'
import './App.css'

const stages = [
  'Introduction',
  'Permission',
  'Discovery',
  'Pitch',
  'Objections',
  'Next Steps',
  'Close',
]

const initialCalls = []

function App() {
  const [activeStage, setActiveStage] = useState(0)
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [objective, setObjective] = useState('')
  const [objection, setObjection] = useState('')
  const [notes, setNotes] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [calls, setCalls] = useState(initialCalls)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
  async function loadCalls() {
    try {
      const response = await fetch('http://127.0.0.1:8000/calls')
      const result = await response.json()

      if (response.ok && result.status === 'success') {
        const savedCalls = result.data.map((call) => ({
          id: call.id,
          name: call.prospect_name,
          contact: call.contact_person || 'Not provided',
          outcome: call.outcome || 'Not specified',
          date: call.call_date
            ? new Date(call.call_date).toLocaleString()
            : '',
        }))

        setCalls(savedCalls)
      }
    } catch (error) {
      console.error('Could not load call history:', error)
      setMessage('Could not load calls from the database.')
    } finally {
      setLoading(false)
    }
  }

  loadCalls()
}, [])

  const stagePrompts = [
    {
      title: 'Make a strong first impression',
      description: 'Introduce yourself and establish why you are calling.',
      prompt: 'Hi, this is [Your Name]. I am reaching out to learn how your team currently handles [business problem]. Is this a good time for a brief conversation?',
    },
    {
      title: 'Ask for permission',
      description: 'Respect their time and get permission to continue.',
      prompt: 'I only need a couple of minutes to understand your current process. Would it be okay if I asked you two quick questions?',
    },
    {
      title: 'Discover their needs',
      description: 'Understand the prospect before presenting a solution.',
      prompt: 'How are you currently managing this process? What is the biggest challenge your team faces? What would you most like to improve?',
    },
    {
      title: 'Present relevant value',
      description: 'Connect the prospect’s problem to a relevant benefit.',
      prompt: 'Based on what you shared, it sounds like [problem] is important to your team. Our solution can help with [relevant benefit]. Would you be interested in exploring how?',
    },
    {
      title: 'Handle objections',
      description: 'Listen carefully, acknowledge the concern and ask a follow-up question.',
      prompt: 'I understand your concern. Could you tell me a little more about what is holding you back? I want to make sure I address the right issue.',
    },
    {
      title: 'Agree on a next step',
      description: 'Turn interest into a clear, mutually agreed action.',
      prompt: 'Would a short follow-up meeting be useful? We could discuss your requirements and determine whether there is a good fit.',
    },
    {
      title: 'Close professionally',
      description: 'Confirm the outcome and thank the prospect.',
      prompt: 'Thank you for your time. To recap, our next step is [agreed action]. I appreciate the conversation and look forward to speaking again.',
    },
  ]

  async function saveCall(outcome) {
  if (!company.trim()) {
    setMessage('Please enter a company or prospect name first.')
    return
  }

  const callData = {
    prospect_name: company.trim(),
    prospect_role: objective.trim() || 'Not specified',
    contact_person: contact.trim() || 'Not provided',
    outcome: outcome,
    call_objective: objective.trim(),
    objection: objection.trim(),
    notes: notes.trim(),
    next_step: nextStep.trim(),
  }

  try {
    setMessage('Saving call...')

    const response = await fetch('http://127.0.0.1:8000/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callData),
    })

    const result = await response.json()

    if (!response.ok || result.status !== 'success') {
      setMessage('Could not save call. Please try again.')
      return
    }

    const savedCall = result.data[0]

    setCalls((previous) => [
      {
        id: savedCall.id,
        name: savedCall.prospect_name,
        contact: savedCall.contact_person || 'Not provided',
        outcome: savedCall.outcome || outcome,
        date: savedCall.call_date
          ? new Date(savedCall.call_date).toLocaleString()
          : new Date().toLocaleString(),
      },
      ...previous,
    ])

    setMessage('Call saved successfully!')

    setCompany('')
    setContact('')
    setObjective('')
    setObjection('')
    setNotes('')
    setNextStep('')
    setActiveStage(0)
  } catch (error) {
    console.error('Save call error:', error)
    setMessage('Could not connect to the backend.')
  }
}

    

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(stagePrompts[activeStage].prompt)
      setMessage('Call script copied to clipboard.')
    } catch {
      setMessage('Select and copy the script manually.')
    }
  }

  const completed = Math.round(((activeStage + 1) / stages.length) * 100)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CallFlow</h2>
            <span>SALES WORKSPACE</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item selected">▦ &nbsp; Call Assistant</button>
        <button
          className="nav-item"
          onClick={() =>
            document.getElementById('history')?.scrollIntoView({
              behavior: 'smooth',
            })
          }
        >
          ◷ &nbsp; Call History
        </button>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Workspace ready</strong>
            <span>CallFlow MVP · Local mode</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Call Assistant</span>
            <h1>Cold Call Assistant</h1>
            <p>Have better sales conversations, one stage at a time.</p>
          </div>
          <div className="live-badge">
            <span /> READY TO CALL
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">TOTAL CALLS LOGGED</span>
            <strong>{calls.length}</strong>
            <small>Calls in this session</small>
          </div>
          <div className="stat-card">
            <span className="stat-label">CURRENT STAGE</span>
            <strong>{activeStage + 1}<span> / {stages.length}</span></strong>
            <small>{stages[activeStage]}</small>
          </div>
          <div className="stat-card">
            <span className="stat-label">CALL PROGRESS</span>
            <strong>{completed}%</strong>
            <div className="progress-track">
              <div style={{ width: `${completed}%` }} />
            </div>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="panel stages-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">YOUR WORKFLOW</span>
                <h2>Call stages</h2>
              </div>
              <span className="stage-count">{activeStage + 1} of {stages.length}</span>
            </div>

            <div className="stage-list">
              {stages.map((stage, index) => (
                <button
                  key={stage}
                  onClick={() => {
                    setActiveStage(index)
                    setMessage('')
                  }}
                  className={`stage-item ${activeStage === index ? 'active' : ''} ${index < activeStage ? 'completed' : ''}`}
                >
                  <span className="stage-number">
                    {index < activeStage ? '✓' : String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="stage-name">{stage}</span>
                  <span className="stage-arrow">{activeStage === index ? '→' : ''}</span>
                </button>
              ))}
            </div>

            <div className="stage-footer">
              <span>Call progression</span>
              <strong>{completed}%</strong>
            </div>
            <div className="progress-track large">
              <div style={{ width: `${completed}%` }} />
            </div>
          </div>

          <div className="panel script-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">STAGE {String(activeStage + 1).padStart(2, '0')}</span>
                <h2>{stagePrompts[activeStage].title}</h2>
              </div>
              <span className="script-icon">✦</span>
            </div>

            <p className="stage-description">{stagePrompts[activeStage].description}</p>

            <div className="script-box">
              <div className="script-box-heading">
                <span> SUGGESTED TALK TRACK</span>
                <span className="editable-label">Editable template</span>
              </div>
              <p>{stagePrompts[activeStage].prompt}</p>
              <button className="copy-button" onClick={copyScript}>▣ &nbsp; Copy script</button>
            </div>

            {activeStage === 1 && (
              <div className="notice">
                <strong>Approved wording needed</strong>
                <p>Replace this placeholder with Meridian-approved wording before using it in a real call.</p>
              </div>
            )}

            <div className="stage-navigation">
              <button
                className="button secondary"
                disabled={activeStage === 0}
                onClick={() => setActiveStage((stage) => stage - 1)}
              >
                ← Previous
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setActiveStage((stage) => Math.min(stage + 1, stages.length - 1))
                  setMessage('')
                }}
                disabled={activeStage === stages.length - 1}
              >
                Next stage →
              </button>
            </div>
          </div>
        </section>

        <section className="panel details-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CALL RECORD</span>
              <h2>Prospect details & outcome</h2>
            </div>
            <span className="optional-label">Complete during or after the call</span>
          </div>

          <div className="form-grid">
            <label>
              Company / Prospect <span>*</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Acme Technologies"
              />
            </label>
            <label>
              Contact person
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="e.g. Alex Morgan"
              />
            </label>
            <label className="full-width">
              Call objective
              <input
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                placeholder="What do you want to achieve?"
              />
            </label>
            <label className="full-width">
              Objection or concern
              <textarea
                value={objection}
                onChange={(event) => setObjection(event.target.value)}
                placeholder="e.g. Not interested, budget concerns, already using another solution..."
                rows="2"
              />
            </label>
            <label className="full-width">
              Call notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Capture key needs, context and important details..."
                rows="3"
              />
            </label>
            <label className="full-width">
              Agreed next step
              <input
                value={nextStep}
                onChange={(event) => setNextStep(event.target.value)}
                placeholder="e.g. Schedule a 15-minute demo on Thursday"
              />
            </label>
          </div>

          {message && <div className="feedback-message">{message}</div>}

          <div className="save-actions">
            <button className="button secondary" onClick={() => saveCall('Follow-up scheduled')}>
              Save follow-up
            </button>
            <button className="button secondary" onClick={() => saveCall('Not interested')}>
              Log not interested
            </button>
            <button className="button primary" onClick={() => saveCall('Call completed')}>
              ✓ &nbsp; Save call
            </button>
          </div>
          <p className="privacy-note">MVP note: call records currently remain in this browser session. Database persistence will be connected separately.</p>
        </section>

        <section className="panel history-panel" id="history">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RECENT ACTIVITY</span>
              <h2>Call history</h2>
            </div>
            <span className="stage-count">{calls.length} records</span>
          </div>

          {calls.length === 0 ? (
            <div className="empty-state">
              <span>◷</span>
              <strong>No calls logged yet</strong>
              <p>Saved call records will appear here.</p>
            </div>
          ) : (
            <div className="history-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>COMPANY / PROSPECT</th>
                    <th>CONTACT</th>
                    <th>OUTCOME</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <tr key={call.id}>
                      <td><strong>{call.name}</strong></td>
                      <td>{call.contact}</td>
                      <td><span className="outcome-badge">{call.outcome}</span></td>
                      <td>{call.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>CallFlow · Cold-call workflow MVP <span>Built for better conversations.</span></footer>
      </main>
    </div>
  )
}

export default App