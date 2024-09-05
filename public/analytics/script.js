const ANALYTICS_URL = 'https://analytics-tan-psi.vercel.app/api/analytics';

// List of known bot user agents
const botUserAgents = [
  'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'Sogou', 'Exabot', 'facebot', 'ia_archiver'
];

function isBot(userAgent) {
  return botUserAgents.some(bot => userAgent.includes(bot));
}

function sendEvent(eventData) {
  if (isBot(navigator.userAgent)) {
    console.log('Bot detected, event not sent');
    return;
  }

  // Use a geolocation API to get the country
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
      .then(data => console.log('Event sent successfully:', data))
      .catch(error => {
        console.error('Error sending event:', error);
        console.error('Error details:', error.message);
      });
    })
    .catch(error => {
      console.error('Error fetching country:', error);
      // Send event without country information if geolocation fails
      sendEventWithoutCountry(eventData);
    });
}

function sendEventWithoutCountry(eventData) {
  const data = {
    ...eventData,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
    browser: getBrowser(navigator.userAgent),
    country: 'Unknown'
  };

  fetch(ANALYTICS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log('Event sent successfully:', data))
  .catch(error => {
    console.error('Error sending event:', error);
    console.error('Error details:', error.message);
  });
}

function getBrowser(userAgent) {
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("SamsungBrowser")) return "Samsung Browser";
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  if (userAgent.includes("Trident")) return "Internet Explorer";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  return "Unknown";
}

function trackPageView() {
  sendEvent({
    type: 'pageview',
    url: window.location.href,
    path: window.location.pathname,
  });
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

document.addEventListener('DOMContentLoaded', trackPageView);

window.trackAnalyticsEvent = sendEvent;