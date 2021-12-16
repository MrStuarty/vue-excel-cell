# vue-excel-cell

```
npm install vue-excel-cell --save
```

in 'main.js' file

```
import Vue from 'vue'
import VueExcelCell from 'vue-excel-cell'

Vue.use(VueExcelCell)
```

in your '*.vue' file

```
<vue-excel-cell></vue-excel-cell>
```

#OR directly in your '*.vue' file

```
<template>
  <vue-excel-cell ref="table"></vue-excel-cell>
</template>

<script>
import { VueExcelCell } from 'vue-excel-cell'

export default {
  components: { VueExcelCell },
  methods: {
    importFile() {
      this.$refs.table.importFile()
      .then(() => {
      })
      .catch(() => {})
    },
    exportFile() {
      const dataArr = this.getData()
      this.$refs.table.exportFile(dataArr, filename)
      .then(() => {
      })
      .catch(() => {})
    },
    getData() {
      return this.$refs.table.tableData
    }
  }
}
</script>
```

data format
```
dataArr: [
	["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
	["Email", 120, 132, 101, 134, 90, 230, 210],
	["Union Ads", 220, 182, 191, 234, 290, 330, 310],
	["Video Ads", 150, 232, 201, 154, 190, 330, 410],
	["Direct", 320, 332, 301, 334, 390, 330, 320],
	["Search Engine", 820, 932, 901, 934, 1290, 1330, 1320],
];
```

