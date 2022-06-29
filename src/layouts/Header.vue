<template>
  <v-app-bar app color="#c83b29" dark>
    <v-app-bar-nav-icon @click="drawerButton"></v-app-bar-nav-icon>
    <div class="d-flex align-center">
      <v-img
        alt="Vuetify Name"
        contain
        min-width="100"
        src="../assets/oracle-cloud-logo.png"
        width="100"
      />

      <v-img
        alt="OCI Logo"
        class="shrink mr-2"
        contain
        src="../assets/oci-logo.png"
        transition="scale-transition"
        width="50"
      />
    </div>

    <v-spacer></v-spacer>
    <v-switch
      v-model="isNodeChange"
      @change="nodeChange"
      class="pt-0 ma-0"
      label="노드전환"
      color="white"
      hide-details
      ><template v-slot:label>
        <span class="white--text subtitle-1"><button>노드전환</button></span>
      </template></v-switch
    >
    <v-switch
      v-model="layout"
      @change="changeLayout"
      class="pt-0 ma-0 pl-5"
      label="레이아웃 전환"
      color="white"
      hide-details
      ><template v-slot:label>
        <span class="white--text subtitle-1"><button>트리</button></span>
      </template></v-switch
    >
    <v-btn @click="clearGraph" text>
      <span
        class="iconify"
        :data-icon="clearIcon"
        data-width="20"
        data-height="20"
      ></span>
      <span class="ml-3 white--text subtitle-1"></span>
    </v-btn>
    <!--
    <v-btn @click="propertyDialog = true" text>
      <span class="mr-2">Properties</span>
      <span
        class="iconify"
        data-icon="codicon:symbol-property"
        data-width="20"
        data-height="20"
      ></span>
    </v-btn>
    -->
    <v-dialog v-model="propertyDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5"> Properties </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-select
                  v-model="selectedLabel"
                  :items="labelItems"
                  label="Label"
                  dense
                ></v-select>
              </v-col>
              <v-col class="pl-2" cols="2">
                <span
                  class="iconify"
                  :data-icon="selectedIcon"
                  data-width="20"
                  data-height="20"
                ></span>
              </v-col>
            </v-row>
            <v-row align="center" class="mt-0">
              <v-col class="pt-0 pr-5">
                <v-select
                  :items="shapeItems"
                  v-model="selectedShape"
                  label="Shape"
                  dense
                ></v-select>
              </v-col>
            </v-row>
            <v-row align="center" class="mt-0">
              <v-col class="pt-0">
                <v-slider
                  class="pt-3"
                  v-model="selectedSize"
                  label="Size"
                  hint="Size"
                  min="1"
                  max="100"
                  thumb-label="always"
                  thumb-color="red"
                  thumb-size="20"
                  dense
                ></v-slider>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="applyProperties">
            Apply
          </v-btn>
          <v-btn color="green darken-1" text @click="propertyDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script>
export default {
  data: () => ({
    sessionId: null,
    drawer: null,
    cookie: null,
    propertyDialog: false,
    labelItems: ["종목", "제품", "인물", "테마"],
    shapeItems: ["square", "dot", "box"],
    selectedLabel: null,
    selectedShape: null,
    selectedSize: 1,
    selectedIcon: "",
    layout: false,
    layoutData: { layout: "custom", layoutSettings: null },
    isNodeChange: false,
    clearIcon: "carbon:clean"
  }),
  created() {
    this.$EventBus.$on("updateSessionId", () => {
      this.getPGXSessionIdAndLogin();
    });
  },
  mounted() {
    this.getPGXSessionIdAndLogin();
  },
  methods: {
    getPGXSessionIdAndLogin() {
      this.$axios({
        method: "get",
        url: "https://fmja2ofusv4wvfatv7sigiu6oy.apigateway.ap-seoul-1.oci.customer-oci.com/session/get",
        headers: { "Content-Type": "application/json" },
      })
        .then((result) => {
          console.log("Old sessionId: " + this.sessionId);
          console.log("New sessionId: " + result.data.sessionId);
          if (
            this.sessionId !== result.data.sessionId ||
            this.sessionId === null
          ) {
            this.sessionId = result.data.sessionId;
            this.pgxLoginWithSessionId();
          }
        })
        .catch((error) => {
          console.log(error);
          this.pgxLogin();
        });
    },
    pgxLoginWithSessionId() {
      this.$axios({
        method: "post",
        url: "/ui/v1/login/",
        headers: { "Content-Type": "application/json" },
        data: {
          username: "username",
          password: "password",
          //pgqlDriver: "pgxDriver",
          //baseUrl: "http://132.226.238.127:7007/",
          pgqlDriver: "pgqlDriver",
          baseUrl: "jdbc_url",
          sessionId: this.sessionId,
        },
        cossDomain: true,
      })
        .then((result) => {
          console.log("Login with Session ID");
          this.clearIcon = "ep:delete";
          console.log(result);
        })
        .catch((error) => {
          this.pgxLogin();
          console.log(error);
        });
    },
    pgxLogin() {
      this.$axios({
        method: "post",
        url: "/ui/v1/login/",
        headers: { "Content-Type": "application/json" },
        data: {
          username: "username",
          password: "password",
          //pgqlDriver: "pgxDriver",
          //baseUrl: "http://132.226.238.127:7007/",
          pgqlDriver: "pgqlDriver",
          baseUrl: "jdbc_url",
          sessionId: this.sessionId
        },
        cossDomain: true,
      })
        .then((result) => {
          console.log("Login without Session ID");
          this.clearIcon = "carbon:clean";
          console.log(result);
        })
        .catch((error) => {
          alert(error);
          console.log(error);
        });
    },
    drawerButton() {
      this.$EventBus.$emit("drawerButton");
    },
    applyProperties() {
      //this.propertyDialog = !this.propertyDialog;
    },
    clearGraph() {
      this.$EventBus.$emit("clearGraph");
    },
    nodeChange() {
      this.$EventBus.$emit("nodeChange", this.isNodeChange);
    },
    changeLayout() {
      if (this.layout) {
        this.layoutData = {
          layout: "hierarchical",
          layoutSettings: {
            enabled: true,
            levelSeparation: 150,
            nodeSpacing: 100,
            treeSpacing: 200,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
            direction: "UD",
            sortMethod: "hubsize",
            shakeTowards: "leaves",
          },
        };
      } else {
        this.layoutData = {
          layout: "custom",
          layoutSettings: {
            x: "prop_x",
            y: "prop_y",
          },
        };
      }
      this.$EventBus.$emit("changeLayout", this.layoutData);
    },
  },
};
</script>
