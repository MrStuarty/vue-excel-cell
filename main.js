export * as VueExcelCell from "./components/vue-excel-cell";

export default {
  install(Vue) {
    Vue.component("vue-excel-cell", VueExcelCell);
  },
};
