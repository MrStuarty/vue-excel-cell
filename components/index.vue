<template>
  <div>
    <div>
      <button @click="importFile">导入excel</button>
      <button @click="exportFile">导出xlsx</button>
    </div>
    <vue-excel-table ref="table"></vue-excel-table>
  </div>
</template>

<script>
import VueExcelTable from "./vue-excel-table.vue";
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