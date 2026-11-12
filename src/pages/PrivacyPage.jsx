import LegalDocument from '../components/legal/LegalDocument';
import { DATA_SOURCE, SITE } from '../constants/site';
import { Link } from '../router/Link';

const email = <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>;

const SECTIONS = [
  {
    id: 'summary',
    title: 'Summary',
    content: (
      <ul>
        <li>You can use Mise without creating an account or giving us any personal information.</li>
        <li>We don&apos;t use analytics, advertising or tracking cookies.</li>
        <li>Your saved recipes, meal plan, viewing history and theme choice are stored only in your browser.</li>
        <li>Recipe data, photos and fonts are loaded from third-party services, described below.</li>
      </ul>
    ),
  },
  {
    id: 'device-storage',
    title: 'Information stored on your device',
    content: (
      <>
        <p>
          To remember your choices, Mise uses your browser&apos;s local storage and cache. This information stays on your device
          and is never sent to us:
        </p>
        <ul>
          <li>
            <strong>Saved recipes:</strong> the name, photo link and category of recipes you save.
          </li>
          <li>
            <strong>Meal plan:</strong> the recipes you add to each day of your weekly planner.
          </li>
          <li>
            <strong>Recently viewed:</strong> the last 12 recipes you opened.
          </li>
          <li>
            <strong>Theme:</strong> whether you chose the light or dark theme.
          </li>
          <li>
            <strong>Offline copies:</strong> Mise&apos;s pages and code, and the recipe details, photos and fonts you
            have loaded, are kept in your browser&apos;s cache so the site loads quickly, can be installed as an app and
            works without a connection.
          </li>
        </ul>
        <p>
          You can remove this information at any time: unsave recipes, clear your meal plan or viewing history within
          Mise, or clear this site&apos;s data in your browser settings. Because it isn&apos;t stored on our servers, we
          can&apos;t recover it if it is deleted, and it isn&apos;t shared between your devices.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    content: (
      <>
        <p>
          Mise has no user accounts and no sign-up forms, and we don&apos;t collect names, addresses, payment details or
          location data. The only personal information we receive is what you choose to send us by email (see{' '}
          <a href="#contacting-us">Contacting us</a>).
        </p>
        <p>
          Like almost every website, the service that hosts Mise may automatically record basic technical information
          when pages are requested, such as IP address, browser type and the time of the request. This is used to keep
          the site secure and running reliably, and is not used to identify or profile you.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-services',
    title: 'Third-party services',
    content: (
      <>
        <p>
          When you use Mise, your browser connects directly to the services below. Like any website you visit, they
          receive your IP address and standard browser information, and handle it under their own privacy policies:
        </p>
        <ul>
          <li>
            <strong>
              <a href={DATA_SOURCE.url} target="_blank" rel="noopener noreferrer">
                {DATA_SOURCE.name}
              </a>
            </strong>{' '}
            provides recipe information and photos. Your searches are sent to it to find matching recipes.
          </li>
          <li>
            <strong>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Fonts
              </a>
            </strong>{' '}
            provides the typefaces used on the site.
          </li>
          <li>
            <strong>YouTube and original recipe websites</strong> are only contacted if you choose to open a recipe&apos;s
            video or source link.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    content: (
      <p>
        Mise itself does not set cookies. The browser storage described above is used only to make the site work for
        you, and is not used for tracking or advertising.
      </p>
    ),
  },
  {
    id: 'contacting-us',
    title: 'Contacting us',
    content: (
      <p>
        If you email us, including through the <Link to="/contact">contact form</Link> (which opens your own email app),
        we receive your email address and anything you include in your message. We use it only to reply to you and to
        improve Mise, keep it only as long as needed for that purpose, and never sell or share it for marketing.
      </p>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    content: (
      <p>
        Mise is intended for a general audience and is not directed at children under 13. We don&apos;t knowingly
        collect personal information from children. If you believe a child has sent us personal information, please
        contact us and we will delete it.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    content: (
      <p>
        Depending on where you live, you may have the right to ask for a copy of the personal information we hold about
        you, to have it corrected or deleted, or to object to how it is used. As we only hold emails you have sent us,
        the simplest way to make a request is to email {email}.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this policy as Mise changes. When we do, we will update the date at the top of this page. Please
        check back from time to time.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: <p>If you have any questions about this privacy policy or your information, email us at {email}.</p>,
  },
];

function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy policy"
      intro={
        <p className="legal__intro">
          Your privacy matters to us. This policy explains what information {SITE.name} (“we”, “us”) handles when you
          use this website, and the choices you have.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

export default PrivacyPage;
