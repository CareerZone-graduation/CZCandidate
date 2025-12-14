/* global importScripts, firebase, clients */
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAz6_sm6rkwgMjSWlXpiFOqOAmW-pBlwR0",
  authDomain: "careerzone-53619.firebaseapp.com",
  projectId: "careerzone-53619",
  storageBucket: "careerzone-53619.firebasestorage.app",
  messagingSenderId: "911786085213",
  appId: "1:911786085213:web:0d19671640b5aa6cfcb6b4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Force the SW to take control immediately
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// Nhận background message
messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    data: payload.data, // gắn data.url để xử lý khi click
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lắng nghe sự kiện click vào notification
self.addEventListener("notificationclick", function (event) {
  console.log("On notification click: ", event.notification);
  event.notification.close();

  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }

  // Ensure we have a valid absolute URL
  const targetUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    (async function () {
      try {
        // Step 1: Look for an existing key controlled client
        const windowClients = await clients.matchAll({
          type: "window",
          includeUncontrolled: false // Only look for clients we can validly control
        });

        console.log("[SW] Found controlled clients:", windowClients.length);

        for (let client of windowClients) {
          console.log("[SW] Checking controlled client:", client.url);
          if (client.url.includes(self.location.origin)) {
            console.log("[SW] Focusing and navigating existing client...");

            // Focus first
            await client.focus();
            // Then navigate
            await client.navigate(targetUrl);
            return;
          }
        }

        // Step 2: If no controllable client is found, open a new window
        console.log("[SW] No controlled client found, opening new window:", targetUrl);
        if (clients.openWindow) {
          await clients.openWindow(targetUrl);
        }
      } catch (error) {
        console.error("[SW] Error in notification click handler:", error);
      }
    })()
  );
});
