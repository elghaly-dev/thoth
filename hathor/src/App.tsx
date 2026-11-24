import { matchPath, useRouter } from './lib/router';
import { AppShell } from './components/Shell';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductPage } from './pages/Product';
import { SupplierPage } from './pages/Supplier';
import { RfqNew } from './pages/RfqNew';
import { ComparePage } from './pages/Compare';
import { DealPage } from './pages/Deal';
import { MessagesPage } from './pages/Messages';
import { RegisterPage } from './pages/Register';
import { PricingPage } from './pages/Pricing';
import { BuyerDashboard, SupplierDashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

function Routes() {
  const { path } = useRouter();
  let m: Record<string, string> | null;
  if (path === '/') return <Home />;
  if (path === '/catalog') return <Catalog />;
  if ((m = matchPath('/product/:id', path))) return <ProductPage id={m.id} />;
  if ((m = matchPath('/supplier/:id', path))) return <SupplierPage id={m.id} />;
  if (path === '/rfq/new') return <RfqNew />;
  if ((m = matchPath('/rfq/:id', path))) return <ComparePage id={m.id} />;
  if (matchPath('/deal/:id', path)) return <DealPage />;
  if (path === '/messages') return <MessagesPage />;
  if ((m = matchPath('/messages/:id', path))) return <MessagesPage id={m.id} />;
  if (path === '/register') return <RegisterPage />;
  if (path === '/pricing') return <PricingPage />;
  if (path === '/dashboard') return <BuyerDashboard />;
  if (path === '/dashboard/supplier') return <SupplierDashboard />;
  return <NotFound />;
}

export function App() {
  return (
    <AppShell>
      <Routes />
    </AppShell>
  );
}
