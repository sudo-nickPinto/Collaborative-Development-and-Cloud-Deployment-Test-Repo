import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

const emptyForm = {
  name: '',
  message: '',
  topic: '',
  note: '',
}

export default function ApurbFeedback() {
  const [form, setForm] = useState({ ...emptyForm })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/apurb-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Could not save feedback')
      }

      setForm({ ...emptyForm })
      setStatus('success')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <section>
      <h2>Message with Feedback</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            maxLength={100}
            required
          />
        </label>

        <label>
          Message
          <input
            name="message"
            value={form.message}
            onChange={updateField}
            maxLength={255}
            required
          />
        </label>

        <label>
          Topic
          <input
            name="topic"
            value={form.topic}
            onChange={updateField}
            maxLength={100}
            required
          />
        </label>

        <label>
          Feedback note
          <input
            name="note"
            value={form.note}
            onChange={updateField}
            maxLength={255}
            required
          />
        </label>

        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Saving...' : 'Save Feedback'}
        </button>
      </form>

      {status === 'success' && (
        <p role="status">Saved to both tables!</p>
      )}

      {status === 'error' && (
        <p role="alert">Error: {error}</p>
      )}
    </section>
  )
}