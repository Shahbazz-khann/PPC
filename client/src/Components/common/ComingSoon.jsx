import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { Clock } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="bg-[#063B29]/10 p-4 rounded-full mb-4">
          <Clock className="w-12 h-12 text-[#063B29]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#063B29] mb-3">
          Coming Soon
        </h1>
        <p className="text-gray-600 max-w-md mb-8 text-sm md:text-base">
          We are working hard to bring you something amazing. This page is currently under development.
        </p>
        <Link
          to="/"
          className="bg-[#063B29] text-white text-xs font-bold tracking-wider px-6 py-3 rounded-md uppercase hover:bg-[#084833] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
