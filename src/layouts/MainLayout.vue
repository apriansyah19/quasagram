<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-10" bordered>
      <q-toolbar class="constrain">
        <q-btn flat to="/camera" round size="18px" class="large-screen-only q-mr-sm" dense icon="eva-camera-outline" />
        <q-separator class="large-screen-only" vertical spaced />
        <q-toolbar-title class="text-grand-hotel text-bold" style="font-size: 30px">
          Quasagram 
        </q-toolbar-title>
        <q-btn flat to="/" round size="18px" class="large-screen-only" dense icon="eva-home-outline" />
      </q-toolbar>
    </q-header>
    <q-footer class="bg-white" bordered>
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <!-- Wrapping only one DOM element, defined by QBtn -->
        <div v-if="showAppInstallBanner" class="banner-container bg-primary">
          <div class="constrain">
            <q-banner inline-actions rounded class="bg-primary text-white" dense>
              <template v-slot:avatar>
                <q-avatar color="white" icon="eva-camera-outline" text-color="grey-10" font-size="22px"></q-avatar>
              </template>
              <b>Install Quasagram?</b>

              <template v-slot:action>
                <q-btn flat @click="instalApp" class="q-px-sm" dense label="Yes" />
                <q-btn flat @click="showAppInstallBanner = false" class="q-px-sm" dense label="Later" />
                <q-btn flat @click="neverShowAppInstallBanner" class="q-px-sm" dense label="Never" />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>

      <q-tabs class="text-grey-10 small-screen-only" active-color="primary" indicator-color="transparent">
        <q-route-tab to="/" icon="eva-home-outline" />
        <q-route-tab to="/camera" icon="eva-camera-outline" />
      </q-tabs>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <keep-alive :include="['PageHome']">
        <router-view />
      </keep-alive>
    </q-page-container>
  </q-layout>
</template>

<script>
let deferredPrompt

export default {
  name: 'MainLayout',
  data () {
    return {
      showAppInstallBanner: false
    }
  },
  methods: {
    instalApp() {
      this.showAppInstallBanner = false
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = deferredPrompt.userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt = null;
    },
    neverShowAppInstallBanner() {
      this.showAppInstallBanner = false
      this.$q.localStorage.set('neverShowAppInstallBanner', true)
    }
  },
  mounted() {
    // Initialize deferredPrompt for use later to show browser install prompt.
    let neverShowAppInstallBanner = this.$q.localStorage.getItem('neverShowAppInstallBanner')
    if (!neverShowAppInstallBanner) {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        setTimeout(() => {
          this.showAppInstallBanner = true
          
        }, 3000);
        // Optionally, send analytics event that PWA install promo was shown.
      })
    }
  }
}
</script>

<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px
.q-toolbar__title
  @media (max-width: $breakpoint-xs-max)
    text-align: center
.q-footer
.q-tab__icon
  font-size: 30px
</style>
 