import { useState } from 'react'
import './App.css'
import ApurbFeedback from './ApurbFeedback'

// Base URL of the backend API, read from the Vite environment variable
// VITE_API_URL (set in .env.local for dev, and in Vercel's project
// settings for the deployed site). 
const API_URL = import.meta.env.VITE_API_URL

function App() {
  // React holds the current value of each field,
  // and every keystroke updates it via onChange below.
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  // Tracks where we are in the submit process, so the UI can show a
  // loading state and a success/error message .
  const [status, setStatus] = useState('idle') //options are:  idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('')

  // Runs when the form is submitted (button click or Enter key).
  async function handleSubmit(event) {
    // Stop the browser's default full-page reload on form submit;
    // we're handling the submission with fetch instead.
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      // Send the form values to the backend as JSON. 
      // the backend is responsible for actually writing to the database.
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })

      // fetch() only rejects on network failure, not on HTTP error
      // status codes, so we have to check response.ok ourselves.
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      setStatus('success')
      setName('')
      setMessage('')
    } catch (error) {
      // Catches both network errors (fetch rejected) and the
      // "bad status code" error thrown above.
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  return (
    <main>
      <h1>Submit a Message</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Message
          <input value={message} onChange={(e) => setMessage(e.target.value)} required />
        </label>

        {/* Disabled while submitting so a slow request can't be double-sent. */}
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Send'}
        </button>

      </form>
      {/* Only one of these renders at a time, based on the current status. */}
      {status === 'success' && <p className="feedback success">Sent!</p>}
      {status === 'error' && <p className="feedback error">Error: {errorMessage}</p>}

	<ApurbFeedback />
    </main>
  )
}

export default App
