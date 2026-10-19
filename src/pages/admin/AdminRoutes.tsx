import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import AdminShell from './AdminShell';
import EventsList from './EventsList';
import NewEvent from './NewEvent';
import Users from './Users';
import EventAdmin from './EventAdmin';
import * as S from './sections';
import NotFound from '@/pages/NotFound';

/** Todas las rutas /admin/*. Se carga bajo demanda para no pesar en el sitio público. */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<AdminShell />}>
        <Route index element={<EventsList />} />
        <Route path="nuevo" element={<NewEvent />} />
        <Route path="usuarios" element={<Users />} />
        <Route path=":eventId" element={<EventAdmin />}>
          <Route index element={<S.Dashboard />} />
          <Route path="config" element={<S.Config />} />
          <Route path="galeria" element={<S.Gallery />} />
          <Route path="programacion" element={<S.Schedule />} />
          <Route path="gastronomia" element={<S.Food />} />
          <Route path="publicidad" element={<S.Ads />} />
          <Route path="mensajes" element={<S.Messages />} />
          <Route path="bonos" element={<S.Bonos />} />
          <Route path="qr" element={<S.Qr />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
