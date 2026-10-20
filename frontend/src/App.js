import { useLayoutEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  Banknote,
  Bell,
  BookOpenText,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  Fingerprint,
  Globe2,
  GraduationCap,
  HandCoins,
  HardHat,
  Headphones,
  HeartPulse,
  IdCard,
  Landmark,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  Ticket,
  Tv,
  UserRound,
  Zap,
  X,
} from "lucide-react";
import "./App.css";
import "./notifications.css";
import { notifications } from "./data/notifications";
import ownerPhoto from "./image/raj.png";

const PHONE = "9621453345";

const WHATSAPP =
  `https://wa.me/91${PHONE}?text=` +
  encodeURIComponent("नमस्ते! 🙏 मुझे Passport/Pan कार्ड, ऑनलाइन फॉर्म और अन्य CSC सेवाओं के बारे में जानकारी चाहिए। कृपया सहायता करें।")

// Edit this list to change theme order; IDs must match the CSS data-theme names.
const THEME_ROTATION_ORDER = [
  "green",
  "orange",
  "blue",
  "purple",
  "rose",
  "ocean",
  "forest",
  "slate",
];
const THEME_ROTATION_INTERVAL_MS = 30 * 1000;

const services = [
  {
    icon: FileCheck2,
    hindi: "पैन कार्ड",
    english: "PAN Card",
    detail: "New applications & corrections",
  },
  {
    icon: Globe2,
    hindi: "पासपोर्ट सेवाएँ",
    english: "Passport Services",
    detail: "Application guidance & support",
  },
  {
    icon: UserRound,
    hindi: "मतदाता पहचान पत्र",
    english: "Voter ID Card",
    detail: "Registration & updates",
  },
  {
    icon: Smartphone,
    hindi: "ड्राइविंग लाइसेंस",
    english: "Driving Licence",
    detail: "Online assistance",
  },
  {
    icon: Landmark,
    hindi: "आय प्रमाण पत्र",
    english: "Income Certificate",
    detail: "Form filling assistance",
  },
  {
    icon: ShieldCheck,
    hindi: "जाति प्रमाण पत्र",
    english: "Caste Certificate",
    detail: "Application support",
  },
  {
    icon: MapPin,
    hindi: "निवास प्रमाण पत्र",
    english: "Residence Certificate",
    detail: "Online application help",
  },
  {
    icon: Award,
    hindi: "पासपोर्ट फोटो",
    english: "Passport-Size Photography",
    detail: "Quick & clear photographs",
  },
  {
    icon: Sparkles,
    hindi: "ऑनलाइन पंजीकरण",
    english: "Online Registration",
    detail: "Reliable digital assistance",
  },
  {
    icon: Headphones,
    hindi: "लॉगिन व फॉर्म सहायता",
    english: "Login & Form Assistance",
    detail: "Step-by-step guidance",
  },
  {
    icon: GraduationCap,
    hindi: "छात्रवृत्ति फॉर्म सहायता",
    english: "Scholarship Form Assistance",
    detail: "छात्रवृत्ति आवेदन फॉर्म भरना",
  },
  {
    icon: BriefcaseBusiness,
    hindi: "सरकारी नौकरी भर्ती फॉर्म",
    english: "Government Job Vacancy Forms",
    detail: "नई सरकारी नौकरी एवं भर्ती के ऑनलाइन फॉर्म",
  },
  {
    icon: IdCard,
    hindi: "राशन कार्ड सेवाएँ",
    english: "Ration Card Services",
    detail: "नए सदस्य का नाम जोड़ना और अन्य अपडेट",
  },
  {
    icon: HandCoins,
    hindi: "वृद्धावस्था पेंशन सहायता",
    english: "Old Age Pension Assistance",
    detail: "पेंशन की जानकारी, स्टेटस चेक और उपलब्ध सहायता",
  },
  {
    icon: Fingerprint,
    hindi: "AEPS नकद निकासी",
    english: "AEPS Cash Withdrawal",
    detail: "आधार एवं फिंगरप्रिंट से निकासी, जहाँ अधिकृत सेवा उपलब्ध हो",
  },
  {
    icon: BookOpenText,
    hindi: "खतौनी एवं भूलेख सेवाएँ",
    english: "Khatauni / Land Record Services",
    detail: "भूलेख रिकॉर्ड खोजना, निकालना और प्रिंट करना",
  },
  {
    icon: HeartPulse,
    hindi: "आयुष्मान कार्ड आवेदन",
    english: "Ayushman Card Application",
    detail: "आयुष्मान कार्ड के लिए आवेदन सहायता",
  },
  {
    icon: Ticket,
    hindi: "यात्रा एवं टिकट बुकिंग",
    english: "Travel & Ticket Booking",
    detail: "यात्रा और टिकट बुकिंग में सहायता",
  },
  {
    icon: Banknote,
    hindi: "बैंक मनी ट्रांसफर",
    english: "Bank Money Transfer",
    detail: "बैंक मनी ट्रांसफर में सहायता",
  },
  {
    icon: ClipboardList,
    hindi: "परीक्षा एवं दस्तावेज़ सेवाएँ",
    english: "Exam & Document Services",
    detail: "परीक्षा पंजीकरण, एडमिट कार्ड, फोटोकॉपी, प्रिंट और स्कैन",
  },
  {
    icon: Zap,
    hindi: "बिजली बिल भुगतान",
    english: "Electricity Bill Payment",
    detail: "बिजली बिल भुगतान सहायता",
  },
  {
    icon: Smartphone,
    hindi: "मोबाइल रिचार्ज",
    english: "Mobile Recharge",
    detail: "मोबाइल रिचार्ज सहायता",
  },
  {
    icon: Tv,
    hindi: "DTH रिचार्ज",
    english: "DTH Recharge",
    detail: "DTH रिचार्ज सहायता",
  },
  {
    icon: Sprout,
    hindi: "PM-किसान पंजीकरण",
    english: "PM-Kisan Registration & Status",
    detail: "पंजीकरण और स्टेटस चेक सहायता",
  },
  {
    icon: HardHat,
    hindi: "ई-श्रम पंजीकरण",
    english: "e-Shram Registration & Card",
    detail: "ई-श्रम पंजीकरण और कार्ड सहायता",
  },
];

function activeNotifications() {
  const today = new Date();

  return notifications.filter(
    (item) =>
      item.active &&
      (!item.startDate || new Date(item.startDate) <= today) &&
      (!item.expiryDate || new Date(item.expiryDate) >= today),
  );
}

function Logo() {
  return (
    <a
      href="#home"
      className="brand"
      data-testid="brand-home-link"
    >
      <span className="brand-mark">SK</span>

      <span>
        <strong>श्री कृष्णा मोबाइल</strong>
        <small>Shri Krishna Mobile & CSC Seva Kendra</small>
      </span>
    </a>
  );
}

function NotificationBar() {
  const items = activeNotifications();

  if (!items.length) {
    return null;
  }

  return (
    <aside
      className="notice-bar"
      data-testid="notification-marquee"
      aria-label="Latest notifications"
    >
      <div className="notice-label">
        <Bell size={16} />
        <span>सूचनाएँ</span>
        <small>NOTICES</small>
      </div>

      <div className="notice-window">
        <div className="notice-track">
          {[...items, ...items].map((item, index) => (
            <span
              className={`notice-item${item.important ? " important" : ""}${item.blink ? " blinking" : ""}`}
              key={`${item.id}-${index}`}
            >
              <b>{item.title}</b> {item.message}
              <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    let boundaryTimeout;

    const updateTheme = () => {
      root.dataset.theme =
        THEME_ROTATION_ORDER[
          Math.floor(Date.now() / THEME_ROTATION_INTERVAL_MS) %
            THEME_ROTATION_ORDER.length
        ];
      const delay =
        THEME_ROTATION_INTERVAL_MS -
        (Date.now() % THEME_ROTATION_INTERVAL_MS);
      boundaryTimeout = window.setTimeout(updateTheme, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(boundaryTimeout);
        updateTheme();
      }
    };

    updateTheme();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(boundaryTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const visibleServices = useMemo(
    () => (showAll ? services : services.slice(0, 6)),
    [showAll],
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header" data-testid="site-header">
        <div className="container header-inner">
          <Logo />

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            data-testid="mobile-menu-button"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav
            className={menuOpen ? "main-nav open" : "main-nav"}
            data-testid="main-navigation"
          >
            <a
              href="#services"
              onClick={closeMenu}
              data-testid="nav-services-link"
            >
              सेवाएँ <span>Services</span>
            </a>

            <a
              href="#about"
              onClick={closeMenu}
              data-testid="nav-about-link"
            >
              हमारे बारे में <span>About us</span>
            </a>

            <a
              href="#contact"
              onClick={closeMenu}
              data-testid="nav-contact-link"
            >
              संपर्क <span>Contact</span>
            </a>

            <a
              className="nav-call"
              href={`tel:+91${PHONE}`}
              data-testid="header-call-link"
            >
              <Phone size={16} />
              Call us
            </a>
          </nav>
        </div>
      </header>

      <NotificationBar />

      <main>
        <section
          className="hero"
          id="home"
          data-testid="hero-section"
        >
          <div className="hero-glow" />

          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span />
                डिजिटल सेवा केंद्र · Digital Service Centre
              </div>

              <h1>
                आपकी सभी ऑनलाइन सेवाओं का{" "}
                <em>विश्वसनीय केंद्र</em>
              </h1>

              <p>
                हर ज़रूरी डिजिटल सेवा, सरल मार्गदर्शन और भरोसेमंद सहायता —
                आपके अपने क्षेत्र में।
              </p>

              <p className="english-copy">
                All the essential online services, with clear guidance and a
                helping hand you can trust.
              </p>

              <div className="hero-actions">
                <a
                  href="#services"
                  className="button button-gold"
                  data-testid="view-services-button"
                >
                  हमारी सेवाएँ देखें
                  <ArrowRight size={18} />
                </a>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-whatsapp"
                  data-testid="hero-whatsapp-button"
                >
                  <MessageCircle size={18} />
                  WhatsApp करें
                </a>
              </div>

              <div className="hero-meta">
                <span>
                  <Check size={15} />
                  स्पष्ट प्रक्रिया
                </span>

                <span>
                  <Check size={15} />
                  व्यक्तिगत सहायता
                </span>
              </div>
            </div>

            <div
              className="hero-card"
              data-testid="hero-service-card"
            >
              <div className="hero-card-top">
                <span className="live-dot" aria-hidden="true" />
                <span>आपका डिजिटल साथी</span>
              </div>

              <div className="owner-profile">
                <div className="owner-photo-frame">
                  <img
                    src={ownerPhoto}
                    alt="Rajkumar Prajapati, owner of Shri Krishna Mobile & CSC Seva Kendra"
                  />
                </div>

                <div className="owner-details">
                  <h2 className="owner-name">Rajkumar Prajapati</h2>
                  <p className="owner-designation">
                    Owner | Shri Krishna Mobile &amp; CSC Seva Kendra
                  </p>
                  <p className="owner-description">
                    आपकी सभी ऑनलाइन सेवाओं के लिए विश्वसनीय सहायता।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="services-section section-pad"
          id="services"
          data-testid="services-section"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow dark">
                  <span />
                  हमारी सेवाएँ · What we do
                </div>

                <h2>
                  आपका काम, <em>हमारी सहायता</em>
                </h2>
              </div>

              <p>
                From essential documents to online forms, we help you take the
                next step with confidence.
              </p>
            </div>

            <div className="services-grid">
              {visibleServices.map(
                ({ icon: Icon, hindi, english, detail }, index) => (
                  <article
                    className="service-card"
                    key={english}
                    data-testid={`service-card-${index}`}
                  >
                    <div className="service-icon">
                      <Icon size={23} />
                    </div>

                    <div>
                      <h3>{hindi}</h3>
                      <p className="service-english">{english}</p>
                      <p className="service-detail">{detail}</p>
                    </div>

                    <ArrowRight
                      className="service-arrow"
                      size={18}
                    />
                  </article>
                ),
              )}
            </div>

            <button
              className="text-button"
              onClick={() => setShowAll(!showAll)}
              data-testid="toggle-services-button"
            >
              {showAll ? "कम सेवाएँ दिखाएँ" : "सभी सेवाएँ देखें"}
              <ChevronDown
                size={17}
                className={showAll ? "flip" : ""}
              />
            </button>
          </div>
        </section>

        <section
          className="trust-section section-pad"
          id="about"
          data-testid="about-section"
        >
          <div className="container trust-grid">
            <div>
              <div className="eyebrow">
                <span />
                भरोसे की जगह · A place you can trust
              </div>

              <h2>
                कागज़ी काम नहीं,
                <br />
                <em>सुकून चाहिए।</em>
              </h2>

              <p className="large-copy">
                Rajkumar Prajapati और उनकी टीम आपके ऑनलाइन काम को समझने, पूरा
                करने और आगे बढ़ाने में साथ देती है — बिना उलझन के।
              </p>

              <p>
                We believe good service starts with listening. Every customer
                gets patient, personal guidance from start to finish.
              </p>

              <a
                href={`tel:+91${PHONE}`}
                className="outline-button"
                data-testid="about-call-button"
              >
                <Phone size={17} />
                बात करें · Talk to us
              </a>
            </div>

            <div className="trust-points">
              <div className="trust-point">
                <span>01</span>

                <div>
                  <h3>साफ़ और सरल प्रक्रिया</h3>
                  <p>Clear guidance, no confusing steps.</p>
                </div>
              </div>

              <div className="trust-point">
                <span>02</span>

                <div>
                  <h3>आपके समय की कद्र</h3>
                  <p>Helpful assistance that keeps you moving.</p>
                </div>
              </div>

              <div className="trust-point">
                <span>03</span>

                <div>
                  <h3>स्थानीय भरोसा</h3>
                  <p>Serving the Malhanpar community with care.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="contact-section section-pad"
          id="contact"
          data-testid="contact-section"
        >
          <div className="container contact-wrap">
            <div className="contact-copy">
              <div className="eyebrow">
                <span />
                हमसे जुड़ें · Find us
              </div>

              <h2>
                आपका अगला काम,
                <br />
                <em>यहीं से शुरू हो।</em>
              </h2>

              <p>
                Have a question or need help with an online service? Reach out
                — we’re happy to help.
              </p>

              <div className="contact-actions">
                <a
                  href={`tel:+91${PHONE}`}
                  className="contact-line"
                  data-testid="contact-phone-link"
                >
                  <span className="contact-icon">
                    <Phone size={19} />
                  </span>

                  <span>
                    <small>कॉल करें · Call us</small>
                    <strong>+91 {PHONE}</strong>
                  </span>
                </a>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-line"
                  data-testid="contact-whatsapp-link"
                >
                  <span className="contact-icon whatsapp-icon">
                    <MessageCircle size={19} />
                  </span>

                  <span>
                    <small>WhatsApp करें · Chat with us</small>
                    <strong>
                      Start a conversation
                      <ArrowRight size={15} />
                    </strong>
                  </span>
                </a>
              </div>
            </div>

            <div
              className="location-card"
              data-testid="location-card"
            >
              <div className="map-pattern" />

              <MapPin
                className="location-pin"
                size={31}
              />

              <div>
                <small>हमारा पता · Our location</small>

                <h3>Malhanpar, Urwa Road</h3>

                <p>
                  Gorakhpur, 273403
                  <br />
                  Uttar Pradesh, India
                </p>

                <div className="location-landmark">
                  <MapPin size={16} aria-hidden="true" />
                  <p>
                    <strong>Landmark:</strong> आंध्रा बैंक से लगभग 100 मीटर आगे,
                    बाईं तरफ।
                    <span>
                      <strong>English:</strong> Approximately 100 metres ahead
                      of Andhra Bank, on the left-hand side.
                    </span>
                  </p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps?q=26.540054987803558,83.28643960003464"
                target="_blank"
                rel="noreferrer"
                className="map-link"
                data-testid="location-map-link"
              >
                Google Maps पर देखें
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Logo />

          <p>
            डिजिटल सेवाएँ, सरल सहायता।
            <br />
            <span>Digital services, made simple.</span>
          </p>

          <div className="footer-links">
            <a
              href="#services"
              data-testid="footer-services-link"
            >
              Services
            </a>

            <a
              href="#about"
              data-testid="footer-about-link"
            >
              About
            </a>

            <a
              href="#contact"
              data-testid="footer-contact-link"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Shri Krishna Mobile & CSC Seva Kendra
          </span>

          <span>
            Made for the local community · Malhanpar
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
