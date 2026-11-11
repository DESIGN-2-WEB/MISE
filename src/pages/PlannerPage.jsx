import { Printer, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import WeekPlanner from '../components/planner/WeekPlanner';
import { useKitchen } from '../context/kitchen';
import { Link } from '../router/Link';

function PlannerPage() {
  const { plannedCount, clearPlan } = useKitchen();
  const isEmpty = plannedCount === 0;

  const clearWeek = () => {
    if (window.confirm('Clear every recipe from this week’s plan?')) clearPlan();
  };

  return (
    <>
      <PageHeader
        eyebrow="Plan ahead"
        title="Weekly meal planner"
        description="Put saved recipes on the days you'll cook them, see what's on today and print your week. Your plan is kept in this browser."
      >
        <div className="page-header__actions no-print">
          <Link to="/recipes" className="btn btn--primary btn--sm">
            <Search size={16} aria-hidden="true" />
            Find recipes
          </Link>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()} disabled={isEmpty}>
            <Printer size={16} aria-hidden="true" />
            Print plan
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearWeek} disabled={isEmpty}>
            <Trash2 size={16} aria-hidden="true" />
            Clear week
          </button>
        </div>
      </PageHeader>
      <section className="section section--tight" aria-label="This week's meal plan">
        <div className="container">
          <WeekPlanner />
        </div>
      </section>
    </>
  );
}

export default PlannerPage;
