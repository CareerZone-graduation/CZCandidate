import { Outlet } from 'react-router-dom';
import Header from "./Header";
import Footer from "./Footer";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow">
        <div className="container py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
