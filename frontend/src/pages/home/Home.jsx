import Navbar from '../../components/home/Navbar';
import Footer from '../../components/home/Footer';
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';
import {useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const {user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleGetStarted = () => {

    if(user?.businessId) return navigate(`/${(user?.role?.name).toLowerCase()}/dashboard`)
      navigate("/auth")
  }


  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 h-185 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block mb-4 text font-medium text-blue-600 dark:text-blue-400">
            Modern ERP System
          </span>

          <h1 className="text-4xl md:text-7xl font-semibold mb-6 leading-tight">
            Manage your business <br className="hidden sm:block" />
            in one platform
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 mb-8">
            A simple and secure ERP solution to manage operations, users, and
            data efficiently.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-10 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer" onClick={handleGetStarted}>
              Get Started
            </button>
           
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Core Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Analytics"
              desc="Monitor performance with real-time business insights."
            />
            <FeatureCard
              icon={<ShieldCheck size={20} />}
              title="Security"
              desc="Role-based access and secure data protection."
            />
            <FeatureCard
              icon={<Zap size={20} />}
              title="Automation"
              desc="Reduce manual work with smart workflow automation."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <div className="mb-4 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {desc}
      </p>
    </div>
  );
};

export default Home;
