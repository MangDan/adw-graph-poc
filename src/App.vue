<template>
  
  <v-app>
    <Navigation/>
    <Header/>
    <Graph/>
    <Footer/>
  </v-app>
</template>

<script>
//import HelloWorld from './components/HelloWorld';
import Navigation from './layouts/Navigation';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Graph from './views/Graph';

export default {
  name: 'App',

  components: {
    //HelloWorld,
    Navigation,
    Header,
    Footer,
    Graph
  },

  data: () => ({
    //
  })
};
</script>
