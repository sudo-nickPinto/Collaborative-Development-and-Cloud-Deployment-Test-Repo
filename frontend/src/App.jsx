import { useState } from 'react'
import './App.css'
import ApurbFeedback from './ApurbFeedback'

// Base URL of the backend API, read from the Vite environment variable
// VITE_API_URL (set in .env.local for dev, and in Vercel's project
// settings for the deployed site).
const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [course, setCourse] = useState('')
  const [pronobName, setPronobName] = useState('')
  const [pronobMessage, setPronobMessage] = useState('')
  const [note, setNote] = useState('')

  const [messageStatus, setMessageStatus] = useState('idle')
  const [pronobStatus, setPronobStatus] = useState('idle')
  const [messageError, setMessageError] = useState('')
  const [pronobError, setPronobError] = useState('')

  const [tahaName, setTahaName] = useState('')
  const [tahaMessage, setTahaMessage] = useState('')
  const [tahaCategory, setTahaCategory] = useState('')
  const [tahaStatus, setTahaStatus] = useState('idle')
  const [tahaError, setTahaError] = useState('')

  async function submitForm(
    event,
    endpoint,
    body,
    setStatus,
    setError,
    clearFields,
  ) {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      setStatus('success')
      clearFields()
    } catch (error) {
      setStatus('error')
      setError(error.message)
    }
  }

  async function handleCourseSubmit() {
    setMessageStatus('submitting')
    setMessageError('')

    try {
      const response = await fetch(`${API_URL}/api/ulugbek-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, course }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      setMessageStatus('success')
      setName('')
      setMessage('')
      setCourse('')
    } catch (error) {
      setMessageStatus('error')
      setMessageError(error.message)
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

      <h2>Original message</h2>
      <form
        onSubmit={(event) =>
          submitForm(
            event,
            '/api/messages',
            { name, message },
            setMessageStatus,
            setMessageError,
            () => {
              setName('')
              setMessage('')
            },
          )
        }
      >
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Message
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        <label>
          Ulugbek's Course
          <input value={course} onChange={(e) => setCourse(e.target.value)} />
        </label>

        <button type="submit" disabled={messageStatus === 'submitting'}>
          {messageStatus === 'submitting' ? 'Sending...' : 'Send message'}
        </button>
        <button
          type="button"
          onClick={handleCourseSubmit}
          disabled={messageStatus === 'submitting'}
        >
          Save course
        </button>
      </form>
      {/* Only one of these renders at a time, based on the current status. */}
      {messageStatus === 'success' && (
        <p className="feedback success">Message sent!</p>
      )}

      {messageStatus === 'error' && (
        <p className="feedback error">Error: {messageError}</p>
      )}

      <ApurbFeedback />

      <h2>Pronob entry</h2>
      <form
        onSubmit={(event) =>
          submitForm(
            event,
            '/api/pronob',
            { name: pronobName, message: pronobMessage, note },
            setPronobStatus,
            setPronobError,
            () => {
              setPronobName('')
              setPronobMessage('')
              setNote('')
            },
          )
        }
      >
        <label>
          Name
          <input
            value={pronobName}
            onChange={(e) => setPronobName(e.target.value)}
            maxLength={100}
            required
          />
        </label>

        <label>
          Message
          <input
            value={pronobMessage}
            onChange={(e) => setPronobMessage(e.target.value)}
            maxLength={255}
            required
          />
        </label>

        <label>
          Note
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={255}
            required
          />
        </label>

        <button type="submit" disabled={pronobStatus === 'submitting'}>
          {pronobStatus === 'submitting' ? 'Sending...' : 'Send Pronob entry'}
        </button>
      </form>

      {pronobStatus === 'success' && (
        <p className="feedback success">Pronob entry sent!</p>
      )}

      {pronobStatus === 'error' && (
        <p className="feedback error">Error: {pronobError}</p>
      )}

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
        {tahaStatus === 'error' && (
          <p className="feedback error">Error: {tahaError}</p>
        )}
      </section>
    </main>
  )
}

export default App
