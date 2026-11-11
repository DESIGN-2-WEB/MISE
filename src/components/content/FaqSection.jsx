import { FAQ } from '../../content/faq';
import SectionHeader from '../ui/SectionHeader';

function FaqSection() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container container--narrow">
        <SectionHeader id="faq-title" badge="FAQ" title="Frequently asked questions" />
        <div className="faq">
          {FAQ.map(({ question, answer }) => (
            <details key={question} className="faq__item">
              <summary className="faq__question">{question}</summary>
              <p className="faq__answer">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
