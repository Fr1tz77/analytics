const ANALYTICS_URL = 'https://analytics-tan-psi.vercel.app/api/analytics';

// List of known bot user agents
const botUserAgents = [
  'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'Sogou', 'Exabot', 'facebot', 'ia_archiver'
];

function isBot(userAgent) {
  return botUserAgents.some(bot => userAgent.includes(bot));
}

function isLocalhost() {
  return /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(window.location.hostname);
}

function isAutomatedBrowser() {
  return window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress;
}

function shouldTrack() {
  if (isLocalhost()) {
    console.log('Localhost detected, not tracking');
    return false;
  }
  if (isAutomatedBrowser()) {
    console.log('Automated browser detected, not tracking');
    return false;
  }
  if (localStorage.getItem('optOutAnalytics') === 'true') {
    console.log('User opted out of tracking');
    return false;
  }
  return true;
}

function sendEvent(eventData, callback) {
  if (!shouldTrack() || isBot(navigator.userAgent)) {
    console.log('Event not sent due to tracking restrictions');
    if (callback) callback({ status: 'not_sent', reason: 'tracking_restricted' });
    return;
  }

  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const eventWithCountry = {
        ...eventData,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString(),
        browser: getBrowser(navigator.userAgent),
        country: data.country_name || 'Unknown'
      };

      console.log('Sending event data:', eventWithCountry);

      fetch(ANALYTICS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventWithCountry),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Event sent successfully:', data);
        if (callback) callback({ status: 'success', data });
      })
      .catch(error => {
        console.error('Error sending event:', error);
        if (callback) callback({ status: 'error', error });
      });
    })
    .catch(error => {
      console.error('Error fetching country:', error);
      sendEventWithoutCountry(eventData, callback);
    });
}

function sendEventWithoutCountry(eventData, callback) {
  // ... (keep the existing code, but add the callback)
}

function getBrowser(userAgent) {
  // ... (keep the existing code)
}

function trackPageView(callback) {
  sendEvent({
    type: 'pageview',
    url: window.location.href,
    path: window.location.pathname,
  }, callback);
}

let startTime = Date.now();

window.addEventListener('beforeunload', () => {
  const duration = Date.now() - startTime;
  sendEvent({
    type: 'duration',
    duration: duration,
    url: window.location.href,
  });
});

// Track navigation history
let lastPathname = window.location.pathname;
function handleLocationChange() {
  if (window.location.pathname !== lastPathname) {
    lastPathname = window.location.pathname;
    trackPageView();
  }
}

// Set up history change listeners
window.addEventListener('popstate', handleLocationChange);
const originalPushState = window.history.pushState;
window.history.pushState = function() {
  originalPushState.apply(this, arguments);
  handleLocationChange();
};

document.addEventListener('DOMContentLoaded', () => {
  trackPageView();
});

// Expose functions globally
window.trackAnalyticsEvent = sendEvent;
window.optOutAnalytics = () => {
  localStorage.setItem('optOutAnalytics', 'true');
  console.log('User opted out of analytics tracking');
};
window.optInAnalytics = () => {
  localStorage.removeItem('optOutAnalytics');
  console.log('User opted in to analytics tracking');
};