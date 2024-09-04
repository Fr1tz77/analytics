const ANALYTICS_URL = 'https://analytics-tan-psi.vercel.app/api/analytics';

async function sendEvent(eventData) {
  try {
    const response = await fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Event sent successfully:', data);
  } catch (error) {
    console.error('Error sending event:', error);
  }
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

// Call this when the script loads
setTimeout(trackPageView, 100);

// Expose this function globally if you want to track other events
window.trackAnalyticsEvent = sendEvent;