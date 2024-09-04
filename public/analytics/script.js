const ANALYTICS_URL = 'https://analytics-tan-psi.vercel.app/api/analytics';

function sendEvent(eventData) {
  const data = {
    ...eventData,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
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
  .catch(error => console.error('Error sending event:', error));
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