import ExcelCell from "./components/vue-excel-cell.vue";

export const VueExcelCell = ExcelCell;

export default {
  install(Vue) {
    Vue.component("vue-excel-cell", ExcelCell);
  },
};
