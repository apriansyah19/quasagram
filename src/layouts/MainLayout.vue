<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-10" bordered>
      <q-toolbar>
        <q-btn flat to="/camera" round size="18px" class="large-screen-only q-mr-sm" dense icon="eva-camera-outline" />
        <q-separator class="large-screen-only" vertical spaced />
        <q-toolbar-title class="text-grand-hotel text-bold" style="font-size: 30px">
          Quasagram
        </q-toolbar-title>
        <q-btn flat to="/" round size="18px" class="large-screen-only" dense icon="eva-home-outline" />
      </q-toolbar>
    </q-header>

    <q-footer class="bg-white small-screen-only" bordered>
      <q-tabs class="text-grey-10" active-color="primary" indicator-color="transparent">
        <q-route-tab to="/" icon="eva-home-outline" />
        <q-route-tab to="/camera" icon="eva-camera-outline" />
      </q-tabs>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',
  data () {
    return {
      version: this.$q.version
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
 