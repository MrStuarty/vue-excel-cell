export * as VueExcelTable from "./components/vue-excel-table";

export default {
  install(Vue) {
    Vue.component("vue-excel-table", VueExcelTable);
  },
};
