import { ArrowRight, Heart, ShieldCheck, Sparkles, Users } from 'lucide-react';
import FaqSection from '../components/content/FaqSection';
import FeatureGrid from '../components/content/FeatureGrid';
import PageHeader from '../components/layout/PageHeader';
import CallToAction from '../components/ui/CallToAction';
import { DATA_SOURCE } from '../constants/site';
import { Link } from '../router/Link';

const VALUES = [
  {
    icon: Sparkles,
    title: 'Simple by design',
    text: 'No clutter, pop-ups or endless scrolling. Just the recipe, the steps and the tools to cook it.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    text: 'There are no accounts, and no tracking or advertising cookies. Your saved recipes and plans stay on your device.',
  },
  {
    icon: Heart,
    title: 'Free for everyone',
    text: 'Every feature, from search to cooking mode, is free to use. There is nothing to sign up for and nothing to buy.',
  },
  {
    icon: Users,
    title: 'Built for real kitchens',
    text: 'Large text, one-tap timers and a screen that stays on make it easy to follow along with busy hands.',
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Helping you answer “what's for dinner?”"
        description="Mise is a free recipe finder, meal planner and cooking companion, made to take the stress out of everyday cooking."
      />

      <section className="section section--tight">
        <div className="container container--narrow prose">
          <h2>Our story</h2>
          <p>
            Deciding what to cook can take longer than cooking itself. Recipe websites are often buried under adverts and
            life stories, and the planning happens on scraps of paper. We built Mise to bring the whole journey into one
            calm place: find a recipe, plan when you&apos;ll make it, and follow it step by step.
          </p>

          <h2>What&apos;s in a name?</h2>
          <p>
            <em>Mise</em> comes from <em>mise en place</em>, the French kitchen phrase for “everything in its place”. Chefs
            use it to describe getting organised before they start cooking, which is exactly what Mise is here to help you
            do.
          </p>

          <h2>Where our recipes come from</h2>
          <p>
            Recipes and photos are provided by{' '}
            <a href={DATA_SOURCE.url} target="_blank" rel="noopener noreferrer">
              {DATA_SOURCE.name}
            </a>
            , an open, crowd-sourced database of recipes from around the world. Mise doesn&apos;t own this content, and
            recipes aren&apos;t individually tested by us, so please use your own judgement in the kitchen, especially when
            it comes to allergies.
          </p>
        </div>
      </section>

      <FeatureGrid />

      <section className="section section--alt" aria-labelledby="values-title">
        <div className="container">
          <header className="section-header">
            <p className="section-badge">What we believe</p>
            <h2 className="section-title" id="values-title">
              Our principles
            </h2>
          </header>
          <ul className="feature-grid feature-grid--four">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="feature-card">
                <span className="feature-card__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__text">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection />

      <CallToAction
        title="We'd love to hear from you"
        text="Have an idea, found a problem with a recipe, or just want to say hello? Get in touch."
      >
        <Link to="/contact" className="btn btn--primary">
          Contact us
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link to="/recipes" className="btn btn--ghost">
          Browse recipes
        </Link>
      </CallToAction>
    </>
  );
}

export default AboutPage;
