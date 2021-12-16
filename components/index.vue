<template>
  <div>
    <div>
      <button @click="importFile">导入excel</button>
      <button @click="exportFile">导出xlsx</button>
    </div>
    <vue-excel-cell ref="table"></vue-excel-cell>
  </div>
</template>

<script>
import VueExcelTable from "./vue-excel-cell.vue";
export default {
  components: { VueExcelTable },
  methods: {
    importFile() {
      this.$refs.table.importFile();
    },
    exportFile() {
      this.$refs.table.exportFile();
    },
  },
};
</script>

<style>
</style>