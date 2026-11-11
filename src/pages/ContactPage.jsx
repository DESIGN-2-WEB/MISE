import { BookOpen, Clock, Mail, ShieldCheck } from 'lucide-react';
import ContactForm from '../components/contact/ContactForm';
import PageHeader from '../components/layout/PageHeader';
import { SITE } from '../constants/site';
import { Link } from '../router/Link';

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact us"
        title="Get in touch"
        description="Questions, feedback, or spotted a problem with a recipe? We read every message."
      />

      <section className="section section--tight">
        <div className="container contact">
          <div className="contact__form-card">
            <h2 className="contact__heading">Send us a message</h2>
            <ContactForm />
          </div>

          <aside className="contact__aside" aria-label="Other ways to reach us">
            <div className="info-card">
              <Mail size={20} aria-hidden="true" />
              <div>
                <h2 className="info-card__title">Email</h2>
                <p>
                  <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
                </p>
              </div>
            </div>
            <div className="info-card">
              <Clock size={20} aria-hidden="true" />
              <div>
                <h2 className="info-card__title">Response time</h2>
                <p>We aim to reply within a few working days.</p>
              </div>
            </div>
            <div className="info-card">
              <BookOpen size={20} aria-hidden="true" />
              <div>
                <h2 className="info-card__title">Quick answers</h2>
                <p>
                  Many common questions are answered in our <Link to="/about#faq">FAQ</Link>.
                </p>
              </div>
            </div>
            <div className="info-card">
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <h2 className="info-card__title">Privacy</h2>
                <p>
                  We only use your message to reply to you. See our <Link to="/privacy">privacy policy</Link>.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
