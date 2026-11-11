import LegalDocument from '../components/legal/LegalDocument';
import { DATA_SOURCE, SITE } from '../constants/site';
import { Link } from '../router/Link';

const email = <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>;

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Accepting these terms',
    content: (
      <p>
        By using {SITE.name}, you agree to these terms of use and to our <Link to="/privacy">privacy policy</Link>. If
        you don&apos;t agree, please don&apos;t use the site.
      </p>
    ),
  },
  {
    id: 'the-service',
    title: 'The service',
    content: (
      <p>
        {SITE.name} is a free website that helps you find recipes, save them, plan meals and follow recipes step by step.
        We may change, suspend or stop any part of the service at any time, and we can&apos;t promise that it will always
        be available or free of errors.
      </p>
    ),
  },
  {
    id: 'recipe-content',
    title: 'Recipe content',
    content: (
      <>
        <p>
          Recipes, ingredient lists, instructions and photos are provided by{' '}
          <a href={DATA_SOURCE.url} target="_blank" rel="noopener noreferrer">
            {DATA_SOURCE.name}
          </a>
          , a third-party, crowd-sourced database. We don&apos;t write, test or verify these recipes, and we can&apos;t
          guarantee that they are accurate, complete or suitable for you.
        </p>
        <p>Cooking times shown as timers are taken from the recipe text and are a guide only.</p>
      </>
    ),
  },
  {
    id: 'food-safety',
    title: 'Food safety, allergies and diets',
    content: (
      <>
        <p>
          Recipes do not include nutrition, allergen or dietary information, and nothing on {SITE.name} is medical or
          nutritional advice. You are responsible for:
        </p>
        <ul>
          <li>checking every ingredient for allergens and dietary requirements before cooking or serving;</li>
          <li>handling, storing and cooking food safely, including cooking it to a safe temperature;</li>
          <li>taking care with knives, heat and kitchen equipment.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <>
        <p>When using {SITE.name}, you agree not to:</p>
        <ul>
          <li>use the site for anything unlawful, harmful or fraudulent;</li>
          <li>scrape, copy or harvest content in bulk, or overload the site or its data providers with automated requests;</li>
          <li>try to disrupt, damage or gain unauthorised access to the site or the systems it relies on.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-data',
    title: 'Information on your device',
    content: (
      <p>
        Saved recipes, meal plans and history are stored in your browser, not on our servers. They may be lost if you
        clear your browser data, change browser or device, or use private browsing, and we can&apos;t restore them.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    content: (
      <p>
        The {SITE.name} name, design and software belong to us. Recipe content and photos belong to their respective
        owners and are made available through {DATA_SOURCE.name}. You may use the site and print recipes and meal plans
        for your own personal, non-commercial use.
      </p>
    ),
  },
  {
    id: 'third-party-links',
    title: 'Third-party links',
    content: (
      <p>
        {SITE.name} links to other websites, such as recipe sources and videos. We don&apos;t control those sites and
        aren&apos;t responsible for their content, availability or privacy practices.
      </p>
    ),
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    content: (
      <p>
        {SITE.name} is provided “as is” and “as available”, without warranties of any kind, whether express or implied,
        including warranties that it will be accurate, reliable or fit for a particular purpose.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    content: (
      <p>
        To the fullest extent permitted by law, we are not liable for any loss or damage arising from your use of{' '}
        {SITE.name} or from following any recipe, including illness, injury or allergic reactions. Nothing in these terms
        limits any liability that cannot be limited by law.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    content: (
      <p>
        We may update these terms from time to time. The date at the top of this page shows when they last changed, and
        continuing to use {SITE.name} after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: <p>Questions about these terms? Email us at {email}.</p>,
  },
];

function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of use"
      intro={
        <p className="legal__intro">
          These terms explain the rules for using {SITE.name}. Please read them carefully, especially the sections on
          recipe content and food safety.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

export default TermsPage;
