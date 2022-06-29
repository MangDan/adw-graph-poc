<template>
  <v-container class="grey lighten-5">
    <v-navigation-drawer
      v-model="drawer"
      app
      min-height="80vh"
      overlay-opacity="0"
    >
      <v-sheet
        color="lighten-4"
        class="ma-2 mt-3"
        min-height="370px"
        rounded="lg"
        outlined
        elevation="1"
      >
        <div>
          <h3><p class="text-center mt-1 pt-1">Search Form</p></h3>
        </div>
        <v-form ref="form" lazy-validation class="pt-3">
          <v-row>
            <v-col>
              <v-select
                v-model="formData.graph"
                :items="graphItems"
                label="검색 항목 (Graph)"
                class="pl-3"
                dense
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="ml-3 pr-1">
              <v-text-field
                v-model="formData.limit"
                label="검색수 (Limit)"
                required
                dense
              ></v-text-field>
            </v-col>
            <v-col class="mr-3 pl-1">
              <v-text-field
                class="pa-0"
                v-model="formData.size"
                label="노드수 (Fetch Size)"
                required
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- Search Term 을 검색어로 바꾸고  -- by iron -->
          <v-text-field
            class="ma-0 pa-0 pl-3 pr-3"
            v-model="formData.searchTerm"
            label="검색어 (노드)"
            dense
          ></v-text-field>
          <v-row>
            <v-col class="mb-0 pb-0">
              <v-select 
                v-model="formData.edgeProp"
                :items="labelItems"
                label="검색어 (엣지)"
                multiple
                attach
                chips
                class="pl-3 mb-0 pb-0"
                dense
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="pl-5 mt-0 pt-0">
              <v-switch
                v-model="formData.boldEdgeByAmount"
                class="pt-0 ma-0"
                label="노드전환"
                color="red"
                hide-details
                ><template v-slot:label>
                  <span class="caption">ON으로 선택한 경우 AMOUNT가 "0"보다 큰 엣지는 굵게 표시됨.</span>
                </template></v-switch
              >
            </v-col>
          </v-row>
          <v-col class="text-right mt-1 pt-1 pl-3 pr-3">
            <v-btn color="#c83b29" small @click="querySubmit">
              <span class="white--text">Submit</span>
            </v-btn>
          </v-col>
        </v-form>
      </v-sheet>
      <v-sheet
        color="lighten-4"
        class="ma-2 mt-0"
        min-height="305px"
        rounded="lg"
        outlined
        elevation="1"
      >
        <div>
          <h3><p class="text-center mt-1 pt-1">노드 속성</p></h3>
        </div>
        <v-row align="center" class="ml-3 mr-3 mt-0 pt-0">
          <v-col class="pa-0" cols="10">
            <v-select
              @change="selectLabel"
              v-model="selectedLabel"
              :items="labelItems"
              label="Label"
              :disabled="selectedLabel == null || selectedLabel == ''"
              dense
            ></v-select>
          </v-col>
          <v-col class="pl-2" cols="2" @click="iconDialog = !iconDialog">
            <Icon :icon="selectedIcon" style="font-size: 30px" />
          </v-col>
        </v-row>
        <v-row align="center" class="pl-3 pr-3 mt-0 pt-0">
          <v-col class="pt-1 mt-0">
            <v-select
              @change="selectShape"
              :items="shapeItems"
              v-model="selectedShape"
              label="Shape"
              :disabled="selectedLabel == null || selectedLabel == ''"
              dense
            ></v-select>
          </v-col>
        </v-row>
        <v-row align="center" class="pl-3 pr-3 mt-0 pt-0">
          <v-col class="pt-1 mt-0">
            <v-text-field
              v-model="selectedColor"
              label="Color"
              :disabled="selectedLabel == null || selectedLabel == ''"
              readonly
              dense
              @click="colorDialog = !colorDialog"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row align="center" class="pl-3 pr-3 mt-0 pt-0">
          <v-col class="pt-1 mt-1">
            <v-slider
              @change="selectSize"
              v-model="selectedSize"
              label="Size"
              hint="Size"
              min="1"
              max="100"
              thumb-label="always"
              thumb-color="red"
              thumb-size="20"
              dense
              :disabled="selectedLabel == null || selectedLabel == ''"
            ></v-slider>
          </v-col>
        </v-row>
        <v-row class="pl-3 pr-3 mr-1 mt-0 pt-0">
          <v-col class="text-right pa-0 ma-0">
            <v-btn color="#c83b29" small>
              <span class="white--text" @click="applyLabelProperties"
                >Apply</span
              >
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>
    </v-navigation-drawer>
    <v-dialog v-model="iconDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5"> Icons </v-card-title>
        <v-card-text>
          <v-container>
            <v-row justify="space-around">
              <div
                @click="selectIcon('ant-design:stock-outlined')"
                style="cursor: pointer"
              >
                <Icon
                  icon="ant-design:stock-outlined"
                  style="font-size: 20px"
                />
              </div>
              <div
                @click="selectIcon('fxemoji:stockchart')"
                style="cursor: pointer"
              >
                <Icon icon="fxemoji:stockchart" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('arcticons:stockswidget')"
                style="cursor: pointer"
              >
                <Icon icon="arcticons:stockswidget" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('icon-park-twotone:chart-stock')"
                style="cursor: pointer"
              >
                <Icon
                  icon="icon-park-twotone:chart-stock"
                  style="font-size: 20px"
                />
              </div>
              <div
                @click="selectIcon('carbon:heat-map-stocks')"
                style="cursor: pointer"
              >
                <Icon icon="carbon:heat-map-stocks" style="font-size: 20px" />
              </div>
            </v-row>
            <v-row justify="space-around" class="pt-2">
              <div
                @click="selectIcon('gg:product-hunt')"
                style="cursor: pointer"
              >
                <Icon icon="gg:product-hunt" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('carbon:product')"
                style="cursor: pointer"
              >
                <Icon icon="carbon:product" style="font-size: 20px" />
              </div>
              <div
                @click="
                  selectIcon(
                    'material-symbols:production-quantity-limits-sharp'
                  )
                "
                style="cursor: pointer"
              >
                <Icon
                  icon="material-symbols:production-quantity-limits-sharp"
                  style="font-size: 20px"
                />
              </div>
              <div
                @click="selectIcon('fluent:production-20-regular')"
                style="cursor: pointer"
              >
                <Icon
                  icon="fluent:production-20-regular"
                  style="font-size: 20px"
                />
              </div>
              <div
                @click="selectIcon('icon-park:ad-product')"
                style="cursor: pointer"
              >
                <Icon icon="icon-park:ad-product" style="font-size: 20px" />
              </div>
            </v-row>
            <v-row justify="space-around" class="pt-2">
              <div
                @click="selectIcon('bi:person-fill')"
                style="cursor: pointer"
              >
                <Icon icon="bi:person-fill" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('bi:file-person')"
                style="cursor: pointer"
              >
                <Icon icon="bi:file-person" style="font-size: 20px" />
              </div>
              <div @click="selectIcon('bi:person')" style="cursor: pointer">
                <Icon icon="bi:person" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('carbon:location-person')"
                style="cursor: pointer"
              >
                <Icon icon="carbon:location-person" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('codicon:person')"
                style="cursor: pointer"
              >
                <Icon icon="codicon:person" style="font-size: 20px" />
              </div>
            </v-row>
            <v-row justify="space-around" class="pt-2">
              <div
                @click="selectIcon('fluent:dark-theme-20-filled')"
                style="cursor: pointer"
              >
                <Icon
                  icon="fluent:dark-theme-20-filled"
                  style="font-size: 20px"
                />
              </div>
              <div
                @click="selectIcon('mdi:theme-light-dark')"
                style="cursor: pointer"
              >
                <Icon icon="mdi:theme-light-dark" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('arcticons:themes')"
                style="cursor: pointer"
              >
                <Icon icon="arcticons:themes" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('fa-brands:affiliatetheme')"
                style="cursor: pointer"
              >
                <Icon icon="fa-brands:affiliatetheme" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('arcticons:defaultdarktheme')"
                style="cursor: pointer"
              >
                <Icon
                  icon="arcticons:defaultdarktheme"
                  style="font-size: 20px"
                />
              </div>
            </v-row>
            <v-row justify="space-around" class="pt-2">
              <div
                @click="selectIcon('octicon:organization-24')"
                style="cursor: pointer"
              >
                <Icon icon="octicon:organization-24" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('flat-color-icons:organization')"
                style="cursor: pointer"
              >
                <Icon
                  icon="flat-color-icons:organization"
                  style="font-size: 20px"
                />
              </div>
              <div
                @click="selectIcon('icons8:organization')"
                style="cursor: pointer"
              >
                <Icon icon="icons8:organization" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('emojione-monotone:classical-building')"
                style="cursor: pointer"
              >
                <Icon
                  icon="emojione-monotone:classical-building"
                  style="font-size: 20px"
                />
              </div>
              <div @click="selectIcon('bi:building')" style="cursor: pointer">
                <Icon icon="bi:building" style="font-size: 20px" />
              </div>
            </v-row>
            <v-row justify="space-around" class="pt-2">
              <div
                @click="selectIcon('carbon:location-company')"
                style="cursor: pointer"
              >
                <Icon icon="carbon:location-company" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('carbon:location-company-filled')"
                style="cursor: pointer"
              >
                <Icon
                  icon="carbon:location-company-filled"
                  style="font-size: 20px"
                />
              </div>
              <div @click="selectIcon('gg:eventbrite')" style="cursor: pointer">
                <Icon icon="gg:eventbrite" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('logos:eventsentry')"
                style="cursor: pointer"
              >
                <Icon icon="logos:eventsentry" style="font-size: 20px" />
              </div>
              <div
                @click="selectIcon('carbon:intrusion-prevention')"
                style="cursor: pointer"
              >
                <Icon
                  icon="carbon:intrusion-prevention"
                  style="font-size: 20px"
                />
              </div>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="iconDialog = !iconDialog">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="colorDialog" persistent max-width="300">
      <v-card>
        <v-card-title class="text-h5"> Color </v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-color-picker
              v-model="color"
              class="ma-0 pa-0"
              dot-size="20"
              hide-inputs
            ></v-color-picker>
            <v-row>
              <v-spacer></v-spacer>
              <v-col
                ><v-sheet dark class="pl-5" max-width="100" max-height="30">
                  {{ showColor }}
                </v-sheet></v-col
              >
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="selectColor">
            Select
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="colorDialog = !colorDialog"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { Icon } from "@iconify/vue2";

export default {
  components: {
    Icon,
  },
  data: () => ({
    formData: {
      graph: "G_NH_STOCK",
      limit: 10,
      size: 10000,
      searchTerm: "",
      edgeProp: [],
      boldEdgeByAmount: false
    },
    selectedLabel: null,
    selectedIcon: null,
    selectedTempIcon: "bi:x-lg",
    selectedShape: null,
    selectedSize: 0,
    selectedColor: null,
    showHexValue: null,
    boldEdgeByAmount: false,
    graphItems: [
      { text: "선택", value: "" },
      { text: "종목", value: "G_NH_STOCK" },
      { text: "제품", value: "G_NH_PRODUCT" },
      { text: "인물", value: "G_NH_PEOPLE" },
      { text: "테마", value: "G_NH_THEME" },
      // by iron - 기관 회사 이벤트 추가
      { text: "기관", value: "G_NH_AGENT" },
      { text: "회사", value: "G_NH_COMPANY" },
      { text: "이벤트", value: "G_NH_EVENT" },
    ],
    edgePropItems: ["종목", "제품", "인물", "테마", "기관", "회사", "이벤트"],
    labelItems: ["종목", "제품", "인물", "테마", "기관", "회사", "이벤트"],
    shapeItems: [
      "square",
      "dot",
      "box",
      "triangle",
      "triangleDown",
      "ellipse",
      "diamond",
      "hexagon",
      "star",
    ],
    isSelectLabel: true,
    iconDialog: false,
    colorDialog: false,
    config: {
      node: {
        caption: ["V_NAME", "AGENT_NAME", "CORP_NAME", "EVENT_NAME"], // by iron CORP_NAME, EVENT_NAME 추가
        defaultIcon: false,
        icon: {
          종목: "ant-design:stock-outlined",
          제품: "gg:product-hunt",
          인물: "bi:person-fill",
          테마: "arcticons:themes",
          기관: "octicon:organization-24",
          회사: "carbon:location-company",
          이벤트: "gg:eventbrite",
        },
        shape: {
          종목: "dot",
          제품: "dot",
          인물: "dot",
          테마: "dot",
          기관: "dot",
          회사: "dot",
          이벤트: "dot",
        },
        size: {
          종목: 20,
          제품: 20,
          인물: 20,
          테마: 20,
          기관: 20,
          회사: 20,
          이벤트: 20,
        },
        color: {
          종목: "#4666af",
          제품: "#af46a7",
          인물: "#afa746",
          테마: "#87af46",
          기관: "#ae7746",
          회사: "#4697af",
          이벤트: "#2d444a",
        },
      },
      edge: {
        caption: ["label"],
        //saturation: '100%',
        //brightness: '37%',
        color: "@color",
        width: "@weight",
      },
      layout: "custom",
      layoutSettings: {},
    },
    drawer: true,
    rules: [
      (value) => !!value || "Required.",
      (value) => (value && value.length >= 3) || "Min 3 characters",
    ],
    types: ["hex", "hexa", "rgba", "hsla", "hsva"],
    type: "hex",
    hex: "#FF00FF",
    hexa: "#FF00FFFF",
    rgba: { r: 255, g: 0, b: 255, a: 1 },
    hsla: { h: 300, s: 1, l: 0.5, a: 1 },
    hsva: { h: 300, s: 1, v: 1, a: 1 },
  }),
  created() {
    this.$EventBus.$on("drawerButton", () => {
      this.drawer = !this.drawer;
    });

    this.$EventBus.$on("nodeClicked", (node) => {
      this.selectedLabel = node.labels[0];
      this.selectedIcon = this.config.node.icon[this.selectedLabel];
      this.selectedShape = this.config.node.shape[this.selectedLabel];
      this.selectedColor = this.config.node.color[this.selectedLabel];
      this.selectedSize = this.config.node.size[this.selectedLabel];
    });

    this.$EventBus.$on("clearEdgeProp", () => {
      this.clearEdgeProp();
    });
  },
  mounted() {
    this.$EventBus.$emit("initGraph", this.config);
  },
  computed: {
    color: {
      get() {
        return this[this.type];
      },
      set(v) {
        this[this.type] = v;
      },
    },
    showColor() {
      if (typeof this.color === "string") return this.color;

      return JSON.stringify(
        Object.keys(this.color).reduce((color, key) => {
          color[key] = Number(this.color[key].toFixed(2));
          return color;
        }, {}),
        null,
        2
      );
    },
  },
  methods: {
    cleanGraph() {
      this.$EventBus.$emit("cleanGraph");
    },
    querySubmit() {
      if (this.formData.graph !== "") {
        this.$EventBus.$emit("querySubmit", this.formData);
        //this.$EventBus.$emit("updateSessionId");
        this.clearEdgeProp();
      }
      else alert("검색 항목을 선택하여 주세요.");
    },
    selectLabel(label) {
      this.selectedLabel = label;
      this.selectedIcon = this.config.node.icon[this.selectedLabel];
      this.selectedShape = this.config.node.shape[this.selectedLabel];
      this.selectedSize = this.config.node.size[this.selectedLabel];
    },
    changeIcon(icon) {
      this.config.node.icon[this.selectedLabel] = icon;
      this.selectedIcon = icon;
      //this.$EventBus.$emit("updateGraph", this.config);
    },
    selectShape(shape) {
      this.selectedShape = shape;
      this.config.node.shape[this.selectedLabel] = shape;
      //this.$EventBus.$emit("updateGraph", this.config);
    },
    selectColor() {
      this.selectedColor = this.color;
      this.colorDialog = !this.colorDialog;
    },
    openColorPicker() {},
    selectSize(size) {
      this.selectedSize = size;
      this.config.node.size[this.selectedLabel] = size;
      //this.$EventBus.$emit("updateGraph", this.config);
    },
    openIconDialog() {
      console.log("test");
    },
    selectIcon(icon) {
      this.selectedIcon = icon;
      this.iconDialog = !this.iconDialog;
    },
    applyLabelProperties() {
      this.config.node.icon[this.selectedLabel] = this.selectedIcon;
      this.config.node.shape[this.selectedLabel] = this.selectedShape;
      this.config.node.color[this.selectedLabel] = this.selectedColor;
      this.config.node.size[this.selectedLabel] = this.selectedSize;

      this.$EventBus.$emit("updateGraph", this.config);
      // LocalStorage에 업데이트
    },
    clearEdgeProp() {
      if(this.formData.edgeProp.length > 0) {
        this.formData.edgeProp = [];
      }
    }
  },
};
</script>
