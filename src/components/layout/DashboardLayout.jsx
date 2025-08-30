import { Outlet } from 'react-router-dom';
import Header from "./Header";
import Footer from "./Footer";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
