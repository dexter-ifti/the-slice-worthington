import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const BOOKING_URL = 'https://app.whoosh.io/patron/club/the-slice/agenda/simulators/today';
const ADDRESS = '121 W. Wilson Bridge Road, Suite 140, Worthington, OH 43085';
const MAPS_URL = 'https://maps.apple.com/?address=121%20W.%20Wilson%20Bridge%20Road%2C%20Worthington%2C%20OH%2043085';

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" /></svg>;
}

function MapPinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 10.2c0 5-7 10.3-7 10.3s-7-5.3-7-10.3a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></svg>;
}

function App() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showInstallTip, setShowInstallTip] = useState(false);

  useEffect(() => {
    const setConnection = () => setOffline(!navigator.onLine);
    window.addEventListener('online', setConnection);
    window.addEventListener('offline', setConnection);

    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const dismissed = window.localStorage.getItem('slice-install-tip-dismissed');
    const isIPhoneSafari = /iPhone|iPad|iPod/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS/i.test(navigator.userAgent);
    if (isIPhoneSafari && !standalone && !dismissed) setShowInstallTip(true);

    return () => {
      window.removeEventListener('online', setConnection);
      window.removeEventListener('offline', setConnection);
    };
  }, []);

  const handleBooking = (event) => {
    if (!navigator.onLine) {
      event.preventDefault();
      setOffline(true);
    }
  };

  const dismissInstallTip = () => {
    window.localStorage.setItem('slice-install-tip-dismissed', 'true');
    setShowInstallTip(false);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="/" className="logo-link" aria-label="The Slice home">
          <img src="/assets/the-slice-logo.svg" alt="The Slice" />
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" role="img" aria-label="Friends enjoying an indoor golf simulator">
            <div className="hero-wash" />
          </div>
          <div className="hero-copy">
            <p className="welcome">Welcome to the good time.</p>
            <h1 id="hero-title">Swing. Smile.<br /><em>Stay Awhile.</em></h1>
            <p className="hero-support">Approachable Golf™ for everyone in Worthington.</p>
            <a className="primary-button" href={BOOKING_URL} target="_blank" rel="noreferrer" onClick={handleBooking}>
              <span>Book a Bay</span><ArrowIcon />
            </a>
            <p className="booking-note">Opens booking in a new tab</p>
            <p className={`offline-message${offline ? ' is-visible' : ''}`} role="status" aria-live="polite">
              You’re offline. Reconnect to book a bay.
            </p>
          </div>
        </section>

        <section className="details" aria-label="The Slice details">
          <div className="details-row address-row">
            <div className="detail-icon"><MapPinIcon /></div>
            <div>
              <span className="detail-label">Find us</span>
              <a href={MAPS_URL} className="detail-link" target="_blank" rel="noreferrer">{ADDRESS}</a>
            </div>
          </div>
          <div className="details-divider" />
          <div className="details-row venue-row">
            <div>
              <span className="detail-label">A place to gather</span>
              <p className="venue-copy">5 simulator bays. More than just golf.</p>
            </div>
            <a className="website-link" href="https://www.thesliceworthington.com/" target="_blank" rel="noreferrer">Main website <ArrowIcon /></a>
          </div>
        </section>

        {/* Future sections: Memberships, Events, and Promotions belong here when v2 content is ready. */}
        <section className="future-sections" aria-hidden="true" data-future-sections="memberships-events-promotions" />
      </main>

      <footer className="site-footer">© The Slice America™</footer>

      {showInstallTip && (
        <aside className="install-tip" aria-label="Add The Slice to your Home Screen">
          <div className="install-tip-copy">
            <strong>Keep The Slice close</strong>
            <span>Tap <b>Share</b>, then <b>Add to Home Screen</b>.</span>
          </div>
          <button type="button" onClick={dismissInstallTip} aria-label="Dismiss install instructions">×</button>
        </aside>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
