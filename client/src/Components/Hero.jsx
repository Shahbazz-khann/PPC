
import Navbar from './Navbar';
// import faisalMosqueImg from '../assets/FaisalMosque.png';
import faisalMosqueImg from '../assets/fsq.png';

const Hero = () => {
  return (
    <section className="relative w-full h-[560px] md:h-[600px] bg-cover bg-center overflow-hidden flex flex-col justify-between">
      {/* Background Image */}
      <img
        src={faisalMosqueImg}
        alt="Faisal Mosque Hero Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 w-full pt-6 pb-20 flex-1 flex flex-col justify-center items-start text-left">
        {/* Trust Badge */}
        <div className="border border-white/50 bg-black/10 backdrop-blur-[1px] px-4 py-1.5 rounded-md mb-6 inline-block">
          <span className="text-white text-xs md:text-sm font-semibold tracking-wider uppercase">
            PAKISTAN'S MOST TRUSTED
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-5xl font-semibold text-white leading-tight mb-4 tracking-tight">
          Complete Property Solutions <br />
          All Under <span className="text-[#D8A238]">One Roof</span>
        </h1>

        {/* Description */}
        <p className="text-white text-base md:text-lg font-normal mb-8 max-w-2xl leading-relaxed">
          Buy, Sell, Rent, Maintain, Renovate & Invest. <br />
         We  Care For Your Property Like Our Own.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          <button className="bg-[#063B29] text-white text-xs md:text-sm font-bold tracking-wider uppercase px-6 py-3.5 rounded-md">
            EXPLORE SERVICES
          </button>
          <button className="border border-white text-white text-xs md:text-sm font-bold tracking-wider uppercase px-6 py-3.5 rounded-md bg-transparent">
            SEARCH PROPERTIES
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
