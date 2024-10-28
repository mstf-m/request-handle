
const POLL_INTERVAL = 5000; // 5 seconds

self.addEventListener('install', (event) => {
    console.log('Service Worker installed.');
    event.waitUntil(self.skipWaiting()); // Activate immediately
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
    event.waitUntil(self.clients.claim()); // Claim all clients immediately
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'START_POLLING') {
        console.log('Starting polling...');
        startPolling();
    } else if (event.data && event.data.type === 'STOP_POLLING') {
        console.log('Stopping polling...');
        clearInterval(self.pollingInterval);
    }
});

function startPolling() {
    if (self.pollingInterval) return; // Avoid multiple intervals

    self.pollingInterval = setInterval(async () => {
        console.log('Polling for new responses...');

        try {
            const response = await fetch('https://hijab.liara.run/home', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: JSON.stringify({
                    message_id: generateNumericUUID(),
                    token: 'none',
                    device_id: 'IOS_2525225',
                    version: 1,
                    body: { constructor: 300 },
                }),
            });

            if (!response.ok) {
                console.error(`Server returned status ${response.status}`);
                return;
            }

            const data = await response.json();
            if (data?.data?.last_response) {
                console.log('Received response:', data.data.last_response);

                const allClients = await self.clients.matchAll();
                allClients.forEach((client) =>
                    client.postMessage({ type: 'NEW_RESPONSE', payload: data.data.last_response })
                );
            }
        } catch (error) {
            console.error('Error during polling:', error);
        }
    }, POLL_INTERVAL);
}

function generateNumericUUID() {
    return parseInt(crypto.randomUUID().replace(/\D/g, '').substring(0, 12), 10);
}
