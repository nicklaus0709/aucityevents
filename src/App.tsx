import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import Landing from '@/pages/public/Landing';
import EventLayout from '@/pages/public/EventLayout';
import EventHome from '@/pages/public/EventHome';
import Schedule from '@/pages/public/Schedule';
import Food from '@/pages/public/Food';
import Ads from '@/pages/public/Ads';
import Contact from '@/pages/public/Contact';
import Bonos from '@/pages/public/Bonos';
import NotFound from '@/pages/NotFound';
import Spinner from '@/components/Spinner';

const AdminRoutes = lazy(() => import('@/pages/admin/AdminRoutes'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/e/:slug" element={<EventLayout />}>
            <Route index element={<EventHome />} />
            <Route path="eventos" element={<Schedule />} />
            <Route path="gastronomia" element={<Food />} />
            <Route path="publicidad" element={<Ads />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="bonos" element={<Bonos />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/*" element={<Suspense fallback={<Spinner />}><AdminRoutes /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
