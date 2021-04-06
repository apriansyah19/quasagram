/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst } from 'workbox-strategies';
import {skipWaiting, clientsClaim} from 'workbox-core';


import {Queue} from 'workbox-background-sync';



self.__WB_DISABLE_DEV_LOGS = true

skipWaiting();
clientsClaim();
/*

 config

 */



precacheAndRoute(self.__WB_MANIFEST);

let backgroundSyncSupported = 'sync' in self.registration ? true : false
console.log(backgroundSyncSupported, 'backgroundSyncSupported')


/*
quene - create Post
*/

let createPostQueue = null
if (backgroundSyncSupported) {
  createPostQueue = new Queue('createPostQueue', {
    onSync: async ({ queue }) => {
      let entry;
      while (entry = await queue.shiftRequest()) {
        try {
          await fetch(entry.request);
          console.log('Replay successful for request', entry.request);
          const channel = new BroadcastChannel('sw-message');
          channel.postMessage({ msg: 'offline-post-uploaded' });
        } catch (error) {
          console.error('Replay failed for request', entry.request, error);
  
          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log('Replay complete!');
    }
  });
}

/*

 caching strategies
 
 */

 registerRoute(
     ({ url }) => url.host.startsWith('fonts.g'),
         new CacheFirst({
          cacheName: 'google-fonts',
          plugins: [
            new ExpirationPlugin({
              maxEntries: 30,
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200]
            }),
          ],
        })
 );
  
 registerRoute(
  ({url}) => url.pathname.startsWith('/posts'),
  new NetworkFirst()
);

registerRoute(
    ({ url }) => url.href.startsWith('http'),
  new StaleWhileRevalidate()
);



/* 
event- fetch
*/
if (backgroundSyncSupported) {
  self.addEventListener('fetch', (event) => {
    if (event.request.url.endsWith('/createPost')) {
      
      // Clone the request to ensure it's safe to read when
      // adding to the Queue.
      if (!self.navigator.onLine) {
        const promiseChain = fetch(event.request.clone()).catch((err) => {
          return createPostQueue.pushRequest({ request: event.request });
        });
      
        event.waitUntil(promiseChain);
      }
    }
  });
}

/*
event - pusg
 */

self.addEventListener('push', event => {
  if (event.data) {
    let data = JSON.parse(event.data.text())
    event.waitUntil(
      self.registration.showNotification(
        data.title,
        {
          body: data.body,
          icon: 'icons/icon-128x128.png',
          badge: 'icons/icon-128x128.png',
          data: {
            openUrl: data.openUrl
          }
        }
      )
    )
  }
})
/*
event - notifications
 */

self.addEventListener('notificationclick', event => {
  let notification = event.notification
  let action = event.action

  if (action === 'hello') {
    console.log('hello');
  } else if (action === 'goodbye') {
    console.log('Goodbye');
  } else {
    event.waitUntil(
      clients.matchAll().then(clis => {
        console.log('anjay');
        let clientsUsingApp = clis.find(cli => {
          return cli.visibilityState === 'visible'
        })
        if (clientsUsingApp) {
          clientsUsingApp.navigate(notification.data.openUrl)
          clientsUsingApp.focus()
        } else {
          clients.openWindow(notification.data.openUrl)
        }
      })
    )
  }
  notification.close()
  // TODO 5.3 - close all notifications when one is clicked
})


self.addEventListener('notificationclose', event => {
  console.log('Notification close');
  // TODO 5.3 - close all notifications when one is clicked
})