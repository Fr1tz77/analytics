const ANALYTICS_URL = 'https://analytics-tan-psi.vercel.app/api/analytics/record-event';

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
    type: 'pageview',
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  };
  
  sendEvent(eventData)
    .then(() => console.log('Pageview tracked successfully'))
    .catch(error => console.error('Error tracking pageview:', error));
}

// Call this when the script loads
trackPageView();

// Expose this function globally for tracking other events
window.trackAnalyticsEvent = sendEvent;