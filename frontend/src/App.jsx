import { useState } from 'react'
import './App.css'

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

  const [tahaName, setTahaName] = useState('')
  const [tahaMessage, setTahaMessage] = useState('')
  const [tahaCategory, setTahaCategory] = useState('')
  const [tahaStatus, setTahaStatus] = useState('idle')
  const [tahaError, setTahaError] = useState('')

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

  async function handleTahaSubmit(event) {
    event.preventDefault()
    setTahaStatus('submitting')
    setTahaError('')

    try {
      const response = await fetch(`${API_URL}/api/taha-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tahaName,
          message: tahaMessage,
          category: tahaCategory,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      setTahaStatus('success')
      setTahaName('')
      setTahaMessage('')
      setTahaCategory('')
    } catch (error) {
      setTahaStatus('error')
      setTahaError(error.message)
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

      <section className="taha-feature">
        <h2>Taha's Categorized Message</h2>
        <form onSubmit={handleTahaSubmit}>
          <label>
            Name
            <input
              value={tahaName}
              onChange={(event) => setTahaName(event.target.value)}
              maxLength="100"
              required
            />
          </label>
          <label>
            Category
            <input
              value={tahaCategory}
              onChange={(event) => setTahaCategory(event.target.value)}
              maxLength="100"
              required
            />
          </label>
          <label>
            Message
            <input
              value={tahaMessage}
              onChange={(event) => setTahaMessage(event.target.value)}
              maxLength="255"
              required
            />
          </label>

          <button type="submit" disabled={tahaStatus === 'submitting'}>
            {tahaStatus === 'submitting' ? 'Saving...' : 'Save Taha Message'}
          </button>
        </form>
        {tahaStatus === 'success' && (
          <p className="feedback success">Saved to both tables!</p>
        )}
        {tahaStatus === 'error' && <p className="feedback error">Error: {tahaError}</p>}
      </section>
    </main>
  )
}

export default App
