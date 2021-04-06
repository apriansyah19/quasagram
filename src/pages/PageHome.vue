<template>
  <q-page class="constrain q-pa-md">
    <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <!-- Wrapping only one DOM element, defined by QBtn -->
        <div v-if="showNotificationBanner && pushNotificationSupport" class="banner-container">
          <div class="constrain">
            <q-banner class="bg-grey-3 q-mb-md">
              <template v-slot:avatar>
                <q-icon color="primary" name="eva-bell-outline"></q-icon>
              </template>
              Would you like to enable notification?

              <template v-slot:action>
                <q-btn flat @click="enableNotification" class="q-px-sm" dense color="primary" label="Yes" />
                <q-btn flat @click="showNotificationBanner = false" class="q-px-sm" dense color="primary" label="Later" />
                <q-btn flat @click="neverShowNotificationBanner" class="q-px-sm" dense color="primary" label="Never" />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>
    <div class="row q-col-gutter-lg">
      <!-- <q-input v-model="encrypt" label="encrypt"></q-input>
      <q-btn label="test" @click="Encrypt(encrypt)">execute</q-btn>
      <q-input v-model="descrypt" label="descrypt"></q-input>
      <q-btn label="test" @click="Decrypt(descrypt)">execute Des</q-btn> -->
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPost && posts.length">
          <q-card v-for="post in posts" :key="post.id" class="card-post q-mb-md" :class="{'bg-red-1' : post.offline}" flat bordered>
            <q-badge v-if="post.offline" color="red" class="absolute-top-right">Stored Offlane</q-badge>
            <q-item>
              <q-item-section avatar>
                <q-avatar size="42px">
                  <img src="https://i.ibb.co/h2Hy5VH/Screenshot-2021-03-18-151815.png">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>satriabudiapri</q-item-label>
                <q-item-label caption>
                  {{ post.location }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />
            <q-img :src="post.imageUrl" />

            <q-card-section>
              <div>{{ post.caption }}</div>
              <div class="text-caption text-grey">{{ post.date | niceDate }} </div>
            </q-card-section>
          </q-card>
        </template>
        <template v-else-if="!loadingPost && !posts.length"> 
          <h5 class="text-center text-grey">No posts yet.</h5>
        </template>
        <template v-else>
          <q-card>
            <q-item>
              <q-item-section avatar>
                <q-skeleton type="QAvatar" size="40px"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" />
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square />

            <q-card-actions align="right" class="q-gutter-md">
              <q-skeleton type="QBtn" />
              <q-skeleton type="QBtn" />
            </q-card-actions>
          </q-card>
        </template>
      </div>
      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="70px">
              <img src="https://i.ibb.co/h2Hy5VH/Screenshot-2021-03-18-151815.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>satriabudiapri</q-item-label>
            <q-item-label caption>
              Satria Budi
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { date, event } from 'quasar'
import { openDB } from 'idb';
import axios from 'axios'
let qs = require('qs');

export default {
  name: 'PageHome',
  data() {
    return {
      posts: [],
      loadingPost: true,
      showNotificationBanner: false,
      encrypt: null,
      descrypt: null
    }
  },
  computed: {
    serviceWorkerSupported() {
      if( 'serviceWorker' in navigator && 'SyncManager' in window) {
        return true
      } else {
        return false
      }
    },
    pushNotificationSupport() {
      if ('PushManager' in window) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    Encrypt(value) {
      console.log(value, 'val');
        var result = "";
        for (let i = 0; i < value.length; i++) {
          if (i < value.length - 1) {
            result += value.charCodeAt(i) + 10;
            result += "-";
          } else {
            result += value.charCodeAt(i) + 10;
          }
        }
        console.log(result, 'hasil')
        return result;
      },
      Decrypt(value) {
        var result = "";
        var array = value.split("-");

        for (let i = 0; i < array.length; i++) {
          result += String.fromCharCode(array[i] - 10);
        }
        console.log(result)
        return result;
      },
    getPosts() {
      this.loadingPost = true
      axios.get(`${ process.env.API }/posts`).then(response => {
        this.posts = response.data
        this.loadingPost = false
        if (!navigator.onLine) {
          this.getOfflinePost()
        }
      }).catch(err => {
        this.$q.dialog({
          title: 'Error',
          message: 'Could not download posts'
        })
        this.loadingPost = false
      })
    },
    getOfflinePost() {
      let db = openDB('workbox-background-sync').then(db => {
        db.getAll('requests').then(failedRequest => {
          failedRequest.forEach(failedRequest => {
            if (failedRequest.queueName = 'createPostQueue') {
              let request = new Request(failedRequest.requestData.url, failedRequest.requestData)
              request.formData().then(formData => {
                let offlinePost = {}
                offlinePost.id = formData.get('id')
                offlinePost.caption = formData.get('caption')
                offlinePost.location = formData.get('location')
                offlinePost.date = +formData.get('date')
                offlinePost.offline = true 

                let reader = new FileReader()
                reader.readAsDataURL(formData.get('file'))
                reader.onloadend = () => {
                  offlinePost.imageUrl = reader.result
                  this.posts.unshift(offlinePost)
                }
              })
            }
          })
        }).catch(err => {
          console.log(err, 'error')
        })
      })
    },
    initNotificationBanner() {
      let neverShowNotificationBanner = this.$q.localStorage.getItem('neverShowNotificationBanner')
    if (!neverShowNotificationBanner) {
      this.showNotificationBanner = true
    }
    },
    listenForOfflinePostUploaded() {
      if (this.serviceWorkerSupported ) {
        const channel = new BroadcastChannel('sw-message');
        channel.addEventListener('message', event => {
          console.log(event.data, 'Recevied');
          if (event.data.msg === 'offline-post-uploaded') {
            let offlinePostCount = this.posts.filter(post => post.offline === true).length
            this.posts[offlinePostCount - 1].offline = false 
          }
        })
      }
    },
    enableNotification() {
      if (this.pushNotificationSupport) {
        Notification.requestPermission(result => {
          this.neverShowNotificationBanner()
          if (result === 'granted') {
            this.checkForExitinPushSubscription()
          }
        })
      }
    },
    displatGrantedNotification() {
      // new Notification("You're subscribe to notification!", {
      //   body: 'Thanks for subscribing!',
      //   icon: 'icons/icon-128x128.png',
      //   image: 'icons/icon-384x384.png',
      //   badge: 'icons/icon-128x128.png',
      //   dir: 'ltr',
      //   lang: 'en-US',
      //   vibrate: [100, 50, 200],
      //   tag:'confirm-notification',
      //   renotify: true,
      // })
      if (this.pushNotificationSupport && this.serviceWorkerSupported) {
        navigator.serviceWorker.ready.then(swreg => {
          swreg.showNotification("You're subscribe to notification!", {
              body: 'Thanks for subscribing!',
              icon: 'icons/icon-128x128.png',
              image: 'icons/icon-384x384.png',
              badge: 'icons/icon-128x128.png',
              dir: 'ltr',
              lang: 'en-US',
              vibrate: [100, 50, 200],
              tag:'confirm-notification',
              renotify: true,
              actions: [
                {
                  action: 'hello',
                  title: 'Hello',
                  icon: 'icons/icon-128x128.png'
                },
                {
                  action: 'goodbye',
                  title: 'Goodby',
                  icon: 'icons/icon-128x128.png'
                }
              ]
            }
          )
        })
      }
    },
    checkForExitinPushSubscription() {
      if (this.pushNotificationSupport && this.serviceWorkerSupported) {
        let reg
        navigator.serviceWorker.ready.then(swreg => {
          reg = swreg
          console.log(swreg, '1')
          return swreg.pushManager.getSubscription()
        }).then(sub => {
          console.log(sub, '2')
          if (!sub) {
            this.createPushSubscription(reg)
          }
        })
      }
    },
    createPushSubscription(reg) {
      let vapidPublicKey = 'BNVPNIvuSaSBxtcJK0DeXg9dSVTu3V6YI1p4WUfXST9PLlobRTvLm3zC9KG3_tfm4Gfhiz78UuQ_NkvoaaJGhnI'
      let convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      }).then(newSub => {
        let newSubData = newSub.toJSON(),
        newSubDataQS =  qs.stringify(newSubData)
        return axios.post(`${ process.env.API }/createSubscription?${ newSubDataQS }`).then(response => {
          this.displatGrantedNotification()
        }).catch(err => {
          console.log(err, 'err')
        })
      })
    },
    neverShowNotificationBanner() {
      this.showNotificationBanner = false
      this.$q.localStorage.set('neverShowNotificationBanner', true)
    },
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  },
  filters: {
      niceDate(value) {
        return date.formatDate(value, 'dddd, DD MMMM YYYY h:mmA')
      }
  },
  activated() {
    this.getPosts()
  },
  created() {
    this.getPosts()
    this.listenForOfflinePostUploaded()
    this.initNotificationBanner()
  }
}
</script>


<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>