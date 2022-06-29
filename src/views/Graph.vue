<template>
  <v-main class="grey lighten-3">
    <v-container fluid>
      <v-row>
        <v-col class="pt-0 mt-0">
          <v-sheet min-height="78vh" rounded="lg">
            <div style="height: 78vh; width: 98%" id="blitzboard"></div>
            <!-- by iron v-breadcrums 추가  시작 -->
            <!--v-breadcrumbs :items="navItems" divider="-"></v-breadcrumbs-->
            <v-breadcrumbs :items="navItems">
              <template v-slot:divider>
                <v-icon>mdi-forward</v-icon>
              </template>
            </v-breadcrumbs>
            <v-navigation-drawer
              v-model="curationDrawer"
              style="z-index: 3"
              absolute
              right
              overlay-opacity="0"
            >
              <v-card>
                <v-card-title>
                  <span class="text-h5">연관 검색 결과</span>
                  <v-btn
                    color="green darken-1"
                    text
                    @click="curationDrawer = false"
                  >
                    닫기
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <div v-html="curationResult"></div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="green darken-1"
                    text
                    @click="curationDrawer = false"
                  >
                    닫기
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-navigation-drawer>
            <!-- by iron v-breadcrums 추가  끝 -->
            <v-btn
              @click="dialog = !dialog"
              color="#c83b29"
              absolute
              fab
              large
              dark
              bottom
              right
            >
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
          </v-sheet>
        </v-col>
      </v-row>

      <v-dialog v-model="dialog" persistent max-width="500px">
        <v-card>
          <v-card-title>
            <!-- by iron 타이틀 변경 시작 -->
            <span class="text-h5">PG Query 직접 입력</span>
            <!-- by iron 타이틀 변경  끝-->
          </v-card-title>
          <v-card-text class="pa-0">
            <v-container fluid class="pa-2">
              <v-textarea
                outlined
                name="input-pg"
                label="PG Query"
                v-model="inputpg"
                counter="6"
              >
              </v-textarea>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="redraw"> Submit </v-btn>
            <v-btn color="blue darken-1" text @click="dialog = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar
      v-model="resultNodeSnackbar"
      timeout="3000"
      absolute
      bottom
      color="primary"
      text
      right
    >
      {{ resultNodeCount }} 건의 노드가 검색되었습니다.

    </v-snackbar>
    </v-container>
  </v-main>
</template>

<script>
export default {
  name: "Graph",

  data: () => ({
    container: null,
    blitzboard: null,
    config: null,
    graph: null,
    inputpg: "SELECT * FROM MATCH (n1)-[e]-(n2) ON G_NH_STOCK LIMIT 20",
    dialog: false,
    graphData: null,
    registerClickEvent: false,
    curation: false,
    curationDrawer: false,
    curationResult: "",
    resultNodeSnackbar: false,
    resultNodeCount: 0,
    graphItems: [
      { text: "종목", value: "G_NH_STOCK" },
      { text: "제품", value: "G_NH_PRODUCT" },
      { text: "인물", value: "G_NH_PEOPLE" },
      { text: "테마", value: "G_NH_THEME" },
      // by iron - 기관 회사 이벤트 추가
      { text: "기관", value: "G_NH_AGENT" },
      { text: "회사", value: "G_NH_COMPANY" },
      { text: "이벤트", value: "G_NH_EVENT" },
    ],
    // by iron -- breadcrumb 데이터 추가 시작
    navItems: [
      {
        text: "시작",
        disabled: true,
        href: "",
      },
    ],
    // by iron -- breadcrumb 데이터 추가 끝
    isNodeChange: false,
  }),
  created() {
    this.$EventBus.$on("nodeChange", (isNodeChange) => {
      this.isNodeChange = isNodeChange;
    });

    this.$EventBus.$on("changeLayout", (layoutData) => {
      this.config.layout = layoutData.layout;
      this.config.layoutSettings = layoutData.layoutSettings;

      this.blitzboard.setGraph(this.graph, true);
      this.blitzboard.setConfig(this.config);

      this.registerClickEventonGraph();
    });

    this.$EventBus.$on("clearGraph", () => {
      this.blitzboard.showLoader();
      this.blitzboard.setGraph("");
      this.blitzboard.hideLoader();
      // by iron -- breadcrumb 데이터 reset 시작
      this.clearBreadcrumb();
      // by iron -- breadcrumb 데이터 reset 끝

      this.registerClickEvent = false;
    });

    this.$EventBus.$on("initGraph", (config) => {
      this.container = document.getElementById("blitzboard");
      this.blitzboard = new Blitzboard(this.container); // no-undef
      this.config = config;

      // pg를 통해서 그래프 생성
      this.blitzboard.setGraph("", false);
      this.blitzboard.setConfig(this.config);

      //by iron
      this.clearBreadcrumb();

      this.registerClickEventonGraph();
    });

    this.$EventBus.$on("querySubmit", (formData) => {
      this.blitzboard.showLoader();

      this.registerClickEvent = false;
      this.formData = formData;
      let query = "";

      // by iron -- breadcrumb 데이터 reset 시작
      this.navItems = [{ text: "시작", disabled: true, href: "" }];
      // by iron -- breadcrumb 데이터 reset 끝

      // Graph만
      // by iron -- query 수정  ( 2022.6.6 18:33)
      let edgePropQuery = "n2";

      if (this.formData.edgeProp.length > 0) {
        edgePropQuery += ":";

        for (const edgeProperty of this.formData.edgeProp) {
          edgePropQuery += '"' + edgeProperty + '"|';
        }

        edgePropQuery = edgePropQuery.slice(0, -1);
      }

      //console.log(edgePropQuery);

      if (this.formData.searchTerm === "") {
        query += "SELECT * FROM MATCH (n1)-[e]-(" + edgePropQuery + ") ";
        query += "ON " + this.formData.graph + " ";
      } else {
        query += "SELECT * FROM MATCH (n1)-[e]-(" + edgePropQuery + ") ";
        query += "ON " + this.formData.graph + " ";
        console.log(query);
        // by iron  --  그래프에 따른 parameter 변경 추가
        let param = "v_name";
        if (this.formData.graph === "G_NH_EVENT") {
          param = "EVENT_NAME";
        } else if (this.formData.graph === "G_NH_COMPANY") {
          param = "CORP_NAME";
        } else if (this.formData.graph === "G_NH_AGENT") {
          param = "AGENT_NAME";
        }
        query +=
          "WHERE JAVA_REGEXP_LIKE(n1." +
          param +
          ", '" +
          this.formData.searchTerm +
          "') ";
      }
      if (this.formData.limit !== "") {
        query += "LIMIT " + this.formData.limit;
      }
      console.log("querySubmit: "+ query);

      this.$axios({
        method: "get",
        url:
          "/ui/v1/query?pgql=" +
          encodeURI(query) +
          "&size=" +
          this.formData.size, // + "&graph=" + this.formData.graph,  -- by iron
        headers: { "Content-type": "application/json" },
        withCredentials: true,
        cossDomain: true,
      }).then((response) => {
        var nodes = [];
        var edges = [];
        let result = response.data;

        console.log("노드개수: " + result.graph.vertices.length);
        result.graph.vertices.forEach((elem) => {
          let node = {
            id: elem._id,
            labels: elem.l,
            properties: {},
          };
          elem.p.forEach((elem_p) => {
            if (elem_p.v) {
              node.properties[elem_p.n] = [elem_p.v];
            }
          });
          nodes.push(node);
        });

        result.graph.edges.forEach((elem) => {
          let edge = {
            id: elem._id,
            from: elem.s,
            to: elem.d,
            labels: elem.l,
            properties: {},
          };
          elem.p.forEach((elem_p) => {
            if (elem_p.v) {
              edge.properties[elem_p.n] = [elem_p.v];
              if (this.formData.boldEdgeByAmount === true) {
                if (edge.properties["RELATIONSHIP_AMOUNT"] !== undefined) {
                  if (edge.properties["RELATIONSHIP_AMOUNT"][0] > 0) {
                    edge.properties["weight"] = "5";
                  }
                  console.log(edge.properties["RELATIONSHIP_AMOUNT"][0]);
                }
              }
            }
          });

          edges.push(edge);
        });

        this.graphData = { nodes: nodes, edges: edges };
        console.log(this.graphData);
        this.blitzboard.setGraph(this.graphData, true);
        this.blitzboard.setConfig(this.config);

        var navText = this.formData.searchTerm;
        if (navText === "") {
          navText = "*";
        }
        this.navItems.push({
          text: navText,
          disabled: false,
          href: "",
        });
        // by iron -- breadcrumb 데이터 푸쉬 끝
        this.registerClickEventonGraph();

        this.resultNodeCount = result.graph.vertices.length;
        this.resultNodeSnackbar = true;

        this.blitzboard.hideLoader();
      }).catch((error) => {
          console.log(error);
          alert(error);
          this.blitzboard.hideLoader();
        });
    });

    this.$EventBus.$on("updateGraph", (config) => {
      this.container = document.getElementById("blitzboard");
      this.config = config;

      // pg를 통해서 그래프 생성
      this.blitzboard.setGraph(this.graph, false);
      this.blitzboard.setConfig(this.config);

      this.registerClickEventonGraph();
    });
  },
  mounted() {},
  methods: {
    registerClickEventonGraph() {
      if (this.registerClickEvent === false) {
        // 더블클릭 시 해당 노드를 기준으로 쿼리
        this.blitzboard.network.on("doubleClick", (e) => {
          if (e.nodes.length > 0) {
            let node = this.blitzboard.nodeMap[e.nodes[0]];
            this.queryByNodeId(node);

            this.registerClickEvent = true;
          }
        });

        // 클릭 시 속성값 가져오기
        this.blitzboard.network.on("click", (e) => {
          if (e.nodes.length > 0) {
            let node = this.blitzboard.nodeMap[e.nodes[0]];
            this.$EventBus.$emit("nodeClicked", node);

            this.blitzboard.scrollNodeIntoView(node);
          }

          // if (e.edges.length > 0) {
          //   let edge = this.blitzboard.edgeMap[e.edges[0]];
          //   //console.log(edge);
          // }
        });

        this.blitzboard.network.on("oncontext", (e) => {
          e.event.preventDefault();
          let nodeId = this.blitzboard.network.getNodeAt(e.pointer.DOM);
          let proxy = this.blitzboard.getNode(nodeId);
          //"V_NAME", "AGENT_NAME", "CORP_NAME", "EVENT_NAME"
          let searchKeyword = "";

          if (proxy.properties["V_NAME"] != undefined) {
            searchKeyword = proxy.properties["V_NAME"][0];
          } else if (proxy.properties["AGENT_NAME"] != undefined) {
            searchKeyword = proxy.properties["AGENT_NAME"][0];
          } else if (proxy.properties["CORP_NAME"] != undefined) {
            searchKeyword = proxy.properties["CORP_NAME"][0];
          } else if (proxy.properties["EVENT_NAME"] != undefined) {
            searchKeyword = proxy.properties["EVENT_NAME"][0];
          }

          console.log(searchKeyword);

          // Naver API 검색 API 호출
          this.$axios({
            method: "get",
            url:
              "https://fmja2ofusv4wvfatv7sigiu6oy.apigateway.ap-seoul-1.oci.customer-oci.com/naver/search?query=" +
              searchKeyword +
              "&display=10&start=1&sort=sim",
            headers: {
              "Content-type": "application/json",
              "X-Naver-Client-Id": "Dki0xzGs4LXleW5yhfv6",
              "X-Naver-Client-Secret": "GgLFdxaKMU",
            },
            crossDomain: true,
          }).then((response) => {
            this.curationResult = "";
            if (response.data.items.length > 0) {
              for (const item of response.data.items) {
                this.curationResult += "<b>" + item.title + "</b><br>";
                this.curationResult += "<hr class='dotted'><br>";
                this.curationResult += "<p>" + item.description + "</p>";
                this.curationResult +=
                  "Link: <a href='" +
                  item.originallink +
                  "' target='_blank'>" +
                  item.originallink +
                  "</a><br>";
                this.curationResult += "작성일자: " + item.pubDate + "<br>";
                this.curationResult += "<hr class='solid'><br>";
              }
            } else {
              this.curationResult += "검색된 결과가 없습니다.";
            }
          });

          this.curationDrawer = true;
        });
      }
    },
    queryByNodeId(node) {
      let graph = this.graphItems.filter((it) =>
        it.text.includes(node.labels[0])
      );

      let query = "";
      let edgePropQuery = "n2";

      if (this.formData.edgeProp.length > 0) {
        edgePropQuery += ":";

        for (const edgeProperty of this.formData.edgeProp) {
          edgePropQuery += '"' + edgeProperty + '"|';
        }

        edgePropQuery = edgePropQuery.slice(0, -1);
      }

      //console.log(edgePropQuery);

      query += "SELECT * FROM MATCH (n1)-[e]-(" + edgePropQuery + ") ";
      query += "ON " + graph[0].value + " ";
      query += "WHERE ID(n1) = '" + node.id + "' ";

      if (this.formData.limit !== "") {
        query += "LIMIT " + this.formData.limit;
      }

      console.log("queryByNodeId: "+ query);
      this.blitzboard.showLoader();

      this.$axios({
        method: "get",
        url:
          "/ui/v1/query?pgql=" +
          encodeURI(query) +
          "&size=" +
          this.formData.size,
        headers: { "Content-type": "application/json" },
        withCredentials: true,
        crossDomain: true,
      }).then((response) => {
        var nodes = [];
        var edges = [];

        let result = response.data;
        // Nodes
        result.graph.vertices.forEach((elem) => {
          let node = {
            id: elem._id,
            labels: elem.l,
            properties: {},
          };
          elem.p.forEach((elem_p) => {
            if (elem_p.v) {
              node.properties[elem_p.n] = [elem_p.v];
            }
          });
          console.log(node);
          // ReDraw
          if (this.isNodeChange) {
            nodes.push(node);
          } else {
            // Add
            this.blitzboard.addNode(node, false);
          }
        });

        // Edges
        result.graph.edges.forEach((elem) => {
          // 여러번 클릭한 경우 동일한 엣지가 계속 생성되는 걸 방지...
          if (!this.blitzboard.hasEdge(elem.s, elem.d)) {
            let edge = {
              id: elem._id,
              from: elem.s,
              to: elem.d,
              labels: elem.l,
              properties: {},
            };
            elem.p.forEach((elem_p) => {
              console.log(elem_p.n);
              if (elem_p.v) {
                edge.properties[elem_p.n] = [elem_p.v];
                edge.properties["weight"] = "1.3";
                edge.properties["color"] = "red";
              }
            });

            // ReDraw
            if (this.isNodeChange) {
              edges.push(edge);
            } else {
              // Add
              this.blitzboard.addEdge(edge, false);
            }
          }
        });
        // Update
        if (this.isNodeChange) {
          this.graphData = { nodes: nodes, edges: edges };
          this.blitzboard.setGraph(this.graphData, true);
          this.blitzboard.setConfig(this.config);
          this.registerClickEvent = false;
        } else {
          this.blitzboard.update();
        }
        this.registerClickEventonGraph();

        // by iron - insert breadcrumb
        this.insertBreadcrumb(node);

        setTimeout(() => this.blitzboard.scrollNodeIntoView(node), 1500);

        this.resultNodeCount = result.graph.vertices.length;
        this.resultNodeSnackbar = true;
        
        this.$EventBus.$emit("clearEdgeProp");


        this.blitzboard.hideLoader();
      });
    },

    // by iron
    // redraw() query 를 받아서 그래프 구성
    // 기존 JSON 구조에서 Query 던지는 것으로 바꿈
    redraw() {
      //this.graph = this.inputpg;
      let query = this.inputpg;

      this.$axios({
        method: "get",
        url: "/ui/v1/query?pgql=" + encodeURI(query) + "&size=10000", // + "&graph=" + this.formData.graph,
        headers: { "Content-type": "application/json" },
        withCredentials: true,
        cossDomain: true,
      }).then((response) => {
        var nodes = [];
        var edges = [];
        let result = response.data;

        result.graph.vertices.forEach((elem) => {
          let node = {
            id: elem._id,
            labels: elem.l,
            properties: {},
          };
          elem.p.forEach((elem_p) => {
            if (elem_p.v) {
              node.properties[elem_p.n] = [elem_p.v];
            }
          });
          nodes.push(node);
        });

        result.graph.edges.forEach((elem) => {
          let edge = {
            id: elem._id,
            from: elem.s,
            to: elem.d,
            labels: elem.l,
            properties: {},
          };
          elem.p.forEach((elem_p) => {
            if (elem_p.v) {
              edge.properties[elem_p.n] = [elem_p.v];
            }
          });

          edges.push(edge);
        });

        this.graphData = { nodes: nodes, edges: edges };
        console.log(this.graphData);
        this.blitzboard.setGraph("");
        this.blitzboard.setGraph(this.graphData, true);
        this.blitzboard.setConfig(this.config);
        this.registerClickEventonGraph();
        //by iron
        this.clearBreadcrumb();

        this.dialog = !this.dialog;
      });
    },
    reConfig() {
      this.config = {
        node: {
          caption: ["id"],
          defaultIcon: false,
          icon: {
            person: "akar-icons:person",
            Property: "f38f",
            Tax: "f119",
            Account: "f119",
            Income: "f316",
          },
          shape: {
            person: "triangle",
            graph: "square",
          },
          size: {
            person: 10,
          },
        },
        edge: {
          caption: ["label"],
          color: {
            say1: "green",
          },
        },
      };

      // pg를 통해서 그래프 생성
      this.blitzboard.setGraph(this.graph, false);
      this.blitzboard.setConfig(this.config);
    },
    // by iron -- breadcrumb 데이터 clear
    clearBreadcrumb() {
      this.navItems = [{ text: "시작", disabled: true, href: "" }];
    },
    // by iron - breadcrumbs 아이템 추가
    insertBreadcrumb(node) {
      var navText = "";
      switch (node.labels[0]) {
        case "기관":
          navText = node.properties.AGENT_NAME[0];
          break;
        case "이벤트":
          navText = node.properties.EVENT_NAME[0];
          break;
        case "회사":
          navText = node.properties.CORP_NAME[0];
          break;
        default:
          navText = node.properties.V_NAME[0];
          break;
      }
      // console.log("navTExt:" + navText);
      // let last = this.navItems[this.navItems.length - 1];
      // console.log("last:" + last.text);
      // if (last.text !== navText) {
      //   this.navItems.push({
      //     text: navText,
      //     disabled: true,
      //     href: "",
      //   });
      // }
      this.navItems.push({
        text: navText,
        disabled: true,
        href: "",
      });
    },
  },
};
</script>
