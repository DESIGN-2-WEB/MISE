import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { SITE } from '../../constants/site';

const CONTACT_TOPICS = [
  'General question',
  'Problem with a recipe',
  'Report a bug',
  'Feature idea',
  'Privacy request',
  'Partnership or press',
];

const EMPTY_FORM = { name: '', email: '', topic: CONTACT_TOPICS[0], message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Please enter your name.';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Please enter a valid email address.';
  if (message.trim().length < 10) errors.message = 'Please write a message of at least 10 characters.';
  return errors;
}

/**
 * Mise has no server, so the form opens the visitor's email app with the
 * message filled in, ready to send to the contact address.
 */
function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    const subject = `[${form.topic}] Message from ${form.name.trim()}`;
    const body = `${form.message.trim()}\n\n—\nName: ${form.name.trim()}\nEmail: ${form.email.trim()}`;
    window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const fieldProps = (field) => ({
    id: `contact-${field}`,
    name: field,
    value: form[field],
    onChange: update(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
  });

  const errorFor = (field) =>
    errors[field] && (
      <p className="field__error" id={`contact-${field}-error`}>
        {errors[field]}
      </p>
    );

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <div className="field">
          <label className="field__label" htmlFor="contact-name">
            Your name
          </label>
          <input className="input" type="text" autoComplete="name" required {...fieldProps('name')} />
          {errorFor('name')}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="contact-email">
            Email address
          </label>
          <input className="input" type="email" autoComplete="email" required {...fieldProps('email')} />
          {errorFor('email')}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="contact-topic">
          Topic
        </label>
        <select className="input select" {...fieldProps('topic')}>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="contact-message">
          Message
        </label>
        <textarea className="input textarea" rows={6} required {...fieldProps('message')} />
        {errorFor('message')}
      </div>

      <div className="contact-form__footer">
        <button type="submit" className="btn btn--primary">
          <Send size={16} aria-hidden="true" />
          Send message
        </button>
        <p className="contact-form__note">This opens your email app with your message ready to send.</p>
      </div>

      {sent && (
        <p className="contact-form__status" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>
            Your email app should now be open. If nothing happened, email us directly at{' '}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
          </span>
        </p>
      )}
    </form>
  );
}

export default ContactForm;
