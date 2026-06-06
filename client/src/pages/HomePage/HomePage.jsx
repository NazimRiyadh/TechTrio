import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";
import asusMain from "../../assets/Asus/main.avif";
import asusZenbook from "../../assets/Asus/awn3jzhftooxxbar-0_0_desktop_0_1X.webp";
import asusTuf from "../../assets/Asus/rn6pfnkl2ixongsg-0_0_desktop_0_1X.webp";
import droneFull from "../../assets/droneFull.webp";
import droneClose from "../../assets/droneClose.webp";
import droneCase from "../../assets/droneCase.webp";
import droneRemote from "../../assets/droneRemote.webp";
import droneLens from "../../assets/droneLens.webp";
import API from "../../api/axios";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./HomePage.css";


const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

const slides = [
  {
    id: 1,
    badge: "Elite Performance",
    title: "ROG Zephyrus Series",
    subtitle: "Precision-engineered for ultimate power. The pinnacle of gaming laptops is here.",
    image: asusMain,
    cta: "Shop ROG",
    link: "/shop?category=Laptops",
    theme: "dark"
  },
  {
    id: 2,
    badge: "Innovation",
    title: "Zenbook Duo OLED",
    subtitle: "Expand your creative horizons with the world's first dual-screen laptop. Pure productivity.",
    image: asusZenbook,
    cta: "Explore Zenbook",
    link: "/shop?category=Laptops",
    theme: "light"
  },
  {
    id: 3,
    badge: "Built to Last",
    title: "Asus TUF Gaming",
    subtitle: "Durability meets performance. Dominate the battlefield with military-grade reliability.",
    image: asusTuf,
    cta: "View TUF",
    link: "/shop?category=Laptops",
    theme: "dark"
  }
];

const HomePage = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const SLIDE_DURATION = 6000;

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length);
    setProgress(0);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/api/v1/product/?limit=8");
        // Filter out products without valid photos
        const hasImage = (p) => p.images?.length > 0 && p.images[0]?.url;
        setNewProducts((data.newProducts || []).filter(hasImage));
        setTopRated((data.topRatedProducts || []).filter(hasImage));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  return (
    <main>
      {/* Hero Slider */}
      <section className="hero-slider-section">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? "100%" : "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? "-100%" : "100%" }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className={`hero-slide ${slides[currentSlide].theme}`}
          >
            <div className="hero-slide-bg">
              <motion.img 
                key={`img-${currentSlide}`}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 6, ease: "easeOut" }}
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title} 
                fetchpriority="high" 
              />
              <div className="hero-overlay" />
            </div>


          </motion.div>
        </AnimatePresence>

        {/* Asus Style Navigation Controls */}
        <div className={`asus-slider-nav ${slides[currentSlide].theme}`}>
          <div className="nav-pill">
            <button className="play-pause" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <FiChevronRight /> : <div className="pause-icon" />}
            </button>
            <div className="nav-dots-container">
              {slides.map((_, i) => (
                <div key={i} className="nav-item-wrap" onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); setProgress(0); }}>
                  {i === currentSlide ? (
                    <div className="progress-bar-wrap">
                      <motion.div 
                        className="progress-fill" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  ) : (
                    <div className="nav-dot-simple" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 32 }}>
            <h2 className="display-lg">New Arrivals</h2>
            <Link to="/shop" className="btn btn-text-link">View All <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : newProducts.length > 0 ? (
            <div className="grid grid-4">{newProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}</div>
          ) : (
            <p className="body-md text-graphite text-center">No new arrivals yet.</p>
          )}
        </div>
      </section>

      {/* Drone Showcase - Premium Bento Grid */}
      <section className="section section-ink drone-showcase-premium">
        <div className="container">
          <div className="flex-between align-end" style={{ marginBottom: 40 }}>
            <div>
              <span className="badge badge-primary-soft" style={{ marginBottom: 12 }}>Aviation Elite</span>
              <h2 className="display-lg text-cream">The Future of Flight</h2>
            </div>
            <p className="body-md text-cream" style={{ opacity: 0.6, maxWidth: 400, textAlign: "right" }}>
              A curated collection of professional aerial tools, designed for creators who demand perfection.
            </p>
          </div>

          <div className="bento-grid-container">
            {/* Main Hero Card */}
            <motion.div 
              className="bento-item bento-main"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <img src={droneFull} alt="Mavic Full Kit" loading="lazy" />
              <div className="bento-content">
                <span className="bento-tag">Flagship</span>
                <h3 className="display-sm">Mavic Pro Series</h3>
                <p className="body-sm">Complete professional ecosystem with multi-battery support.</p>
              </div>
            </motion.div>

            {/* Lens Detail */}
            <motion.div 
              className="bento-item bento-lens"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
            >
              <img src={droneLens} alt="4K Camera Lens" loading="lazy" />
              <div className="bento-content compact">
                <span className="bento-tag">Optics</span>
                <p className="body-emphasis">1-inch CMOS Sensor</p>
              </div>
            </motion.div>

            {/* Remote Control */}
            <motion.div 
              className="bento-item bento-remote"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
            >
              <img src={droneRemote} alt="Smart Controller" loading="lazy" />
              <div className="bento-content compact">
                <span className="bento-tag">Control</span>
                <p className="body-emphasis">OcuSync 3.0 Tech</p>
              </div>
            </motion.div>

            {/* Travel Case */}
            <motion.div 
              className="bento-item bento-case"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
            >
              <img src={droneCase} alt="Travel Case" loading="lazy" />
              <div className="bento-content compact">
                <span className="bento-tag">Portability</span>
                <p className="body-emphasis">Rugged Protection</p>
              </div>
            </motion.div>

            {/* Propeller/Detail */}
            <motion.div 
              className="bento-item bento-detail"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.4 }}
            >
              <img src={droneClose} alt="Propeller Detail" loading="lazy" />
              <div className="bento-content compact">
                <span className="bento-tag">Aero</span>
                <p className="body-emphasis">Silent Propulsion</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Top Rated */}
      <section className="section section-cloud" style={{ contentVisibility: "auto", containIntrinsicSize: "800px" }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 32 }}>
            <h2 className="display-lg">Top Rated Products</h2>
            <Link to="/shop" className="btn btn-text-link">View All <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : topRated.length > 0 ? (
            <div className="grid grid-4">{topRated.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}</div>
          ) : (
            <p className="body-md text-graphite text-center">No top rated products yet.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
