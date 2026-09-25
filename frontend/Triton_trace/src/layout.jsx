import { Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      {/* This is where Home, About, or Contact will be injected */}
      <main className="grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}