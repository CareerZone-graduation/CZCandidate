// src/components/layouts/DashboardLayout.jsx
import Header from "./Header";
import Footer from "./Footer";


const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
