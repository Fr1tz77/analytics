const ANALYTICS_URL = 'https://analytics-tan-psi.vercel.app/api/analytics';

function sendEvent(eventData) {
  fetch(ANALYTICS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
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
  const eventData = {
    name: 'pageview',
    url: window.location.href,
    referrer: document.referrer,
    domain: window.location.hostname,
  };
  
  sendEvent(eventData);
}

document.addEventListener('DOMContentLoaded', trackPageView);

window.trackAnalyticsEvent = sendEvent;