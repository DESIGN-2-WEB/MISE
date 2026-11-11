import { CalendarDays, ChefHat, Heart, Search, SlidersHorizontal, Smartphone } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

const FEATURES = [
  {
    icon: Search,
    title: 'Search by name or ingredients',
    text: "Type a dish, or list what's in your fridge. Suggestions appear as you type.",
  },
  {
    icon: SlidersHorizontal,
    title: 'Filter by cuisine and category',
    text: 'Narrow nearly 800 recipes across 37 cuisines and 14 categories, and share any search as a link.',
  },
  {
    icon: CalendarDays,
    title: 'Plan your week',
    text: "Add saved recipes to any day, see what's on today and print the plan for the fridge door.",
  },
  {
    icon: ChefHat,
    title: 'Cook step by step',
    text: 'Big, clear steps with one-tap timers, and your screen stays on while you cook.',
  },
  {
    icon: Heart,
    title: 'Save your favourites',
    text: 'Keep the recipes you love in one place, without creating an account.',
  },
  {
    icon: Smartphone,
    title: 'Works on every device',
    text: 'Install it on your phone or laptop, switch between light and dark mode, and print any recipe.',
  },
];

function FeatureGrid() {
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <div className="container">
        <SectionHeader
          id="features-title"
          badge="Features"
          title="Everything you need to get dinner on the table"
          subtitle="Mise brings finding, planning and cooking together in one simple, free app."
        />
        <ul className="feature-grid">
          {FEATURES.map(({ icon: Icon, title, text }) => (
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
  );
}

export default FeatureGrid;
