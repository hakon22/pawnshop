import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { resetPledgeForm } from '@web/features/pledge-form/model/pledge-form-slice';
import { PledgeCreatePage } from '@web/pages/pledge-create-page';
import { RedemptionPage } from '@web/pages/redemption-page';
import { useAppDispatch } from '@web/store/hooks';

import type { MouseEvent } from 'react';

interface AppNavItemInterface {
  to: string;
  label: string;
}

interface PledgeLocationStateInterface {
  formKey?: number;
}

const APP_NAV_ITEMS: AppNavItemInterface[] = [
  {
    to: '/pledges/new',
    label: 'Залог',
  },
  {
    to: '/redemptions',
    label: 'Выкуп',
  },
];

const navLinkClassName = ({ isActive }: { isActive: boolean; }): string => {
  const base = 'rounded-md px-3 py-1.5 transition-colors duration-200';
  return isActive
    ? `${base} bg-[var(--color-primary)] text-white`
    : `${base} text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-ink)]`;
};

const AppNav = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handlePledgeNavClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (location.pathname !== '/pledges/new') {
      return;
    }

    event.preventDefault();
    dispatch(resetPledgeForm());
    navigate('/pledges/new', {
      replace: true,
      state: {
        formKey: Date.now(),
      } satisfies PledgeLocationStateInterface,
    });
  };

  return (
    <nav className="flex gap-1 text-sm font-medium" aria-label="Основная навигация">
      {APP_NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/pledges/new'}
          className={navLinkClassName}
          onClick={item.to === '/pledges/new' ? handlePledgeNavClick : undefined}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

const PledgeCreateRoute = () => {
  const location = useLocation();
  const state = location.state as PledgeLocationStateInterface | null;
  const formKey = state?.formKey ?? 'pledge-create';

  return <PledgeCreatePage key={formKey} />;
};

export const AppRouter = () => {
  return (
    <div className="min-h-screen px-4 pb-10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Перейти к содержимому
      </a>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-panel)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 py-4">
          <div className="text-2xl font-semibold tracking-tight text-[var(--color-primary)]">
            Ломбард CRM
          </div>
          <AppNav />
        </div>
      </header>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/pledges/new" replace />} />
          <Route path="/pledges/new" element={<PledgeCreateRoute />} />
          <Route path="/redemptions" element={<RedemptionPage />} />
        </Routes>
      </main>
    </div>
  );
};
