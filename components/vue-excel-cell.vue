<template>
  <div class="vue-excel-cell" @contextmenu.prevent>
    <table class="excel-table-inner">
      <thead>
        <tr>
          <th
            style="width: 70px"
            v-for="(item, idx) in alphaArr"
            :key="item + idx"
            class="e-t-e-col no-select"
            :class="{ 'cell-active': showEditor && position[1] === idx - 1 }"
            @contextmenu.prevent="(e) => contextMenu(e, { type: 'col', idx })"
          >
            {{ item }}
            <i
              v-if="idx !== 0"
              class="resize-line-vertical"
              :class="{ 'line-active': xActive === idx }"
              @mouseenter="(e) => xEnter(e, idx)"
              @mouseleave="xLeave"
              @mousedown.left="(e) => xDragStart(e, idx)"
            ></i>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in dataList" :key="idx" class="e-t-e-row">
          <td
            :class="{ 'cell-active': showEditor && position[0] === idx }"
            class="e-row-title no-select"
            @contextmenu.prevent="(e) => contextMenu(e, { type: 'row', idx })"
          >
            {{ idx + 1 }}
            <i
              class="resize-line-horizontal"
              :class="{ 'line-active': yActive === idx }"
              @mouseenter="(e) => yEnter(e, idx)"
              @mouseleave="yLeave"
              @mousedown.left="(e) => yDragStart(e, idx)"
            ></i>
          </td>
          <td
            class="e-t-e-cell"
            v-for="(i, index) in alphaArr"
            :key="i"
            @mousedown.left="(e) => moveTo(e, [idx, index, row[index] || ''])"
          >
            {{ row[index] || "" }}
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-show="showEditor"
      class="excel-table-editor"
      :style="editorStyle"
      @click.self.stop="getFocus"
    >
      <i class="e-t-e-dot"></i>
      <textarea
        class="e-t-e-text"
        v-show="showText"
        ref="input"
        v-model="inputValue"
        @input="onInput"
      />
    </div>
    <ul class="e-context-menu" v-show="showContext" :style="contextStyle">
      <div :class="{ 'menu-disabled': contextType === 'row' }">
        <li
          @mousedown.left="contextType === 'col' && contextHandler('left-add')"
        >
          左侧添加列
        </li>
        <li
          @mousedown.left="contextType === 'col' && contextHandler('del-col')"
        >
          删除该列
        </li>
        <li
          @mousedown.left="contextType === 'col' && contextHandler('right-add')"
        >
          右侧添加列
        </li>
      </div>
      <div :class="{ 'menu-disabled': contextType === 'col' }">
        <li @mousedown.left="contextType === 'row' && contextHandler('up-add')">
          上侧添加行
        </li>
        <li
          @mousedown.left="contextType === 'row' && contextHandler('del-row')"
        >
          删除该行
        </li>
        <li
          @mousedown.left="contextType === 'row' && contextHandler('down-add')"
        >
          下侧添加行
        </li>
      </div>
    </ul>
  </div>
</template>

<script>
import {
  chooseFile,
  readFile,
  getArrayData,
  exportFile,
} from "../utils/index.js";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default {
  data() {
    return {
      tableData: [],
      showEditor: false,
      showText: false,
      showContext: false,
      editorStyle: {
        left: "1px",
        top: "1px",
        width: "70px",
        height: "30px",
      },
      contextStyle: {
        left: "0px",
        top: "0px",
      },
      contextType: "",
      contextIdx: -1,
      inputValue: "",
      position: [0, 0],
      xActive: -1,
      yActive: -1,
    };
  },
  computed: {
    dataList() {
      const arr = this.tableData.slice();
      while (arr.length < 100) {
        arr.push([]);
      }
      return arr;
    },

    alphaArr() {
      const head = this.tableData[0] || [];
      const len = alphabet.length;
      let arr = [""];
      if (head.length > len) {
        head.forEach((v, i) => {
          const name = alphabet[i % len] + (i === 0 ? "" : i);
          arr.push(name);
        });
      } else {
        arr = alphabet.split("");
        arr.unshift("");
      }
      return arr;
    },
  },
  created() {
    window.addEventListener("mousedown", this.hideControls);
  },
  beforeDestroy() {
    window.removeEventListener("mousedown", this.hideControls);
  },
  methods: {
    hideControls(e) {
      this.showContext = false;
      const name = e.target.className;
      const whiteList = [
        "excel-table-editor",
        "e-t-e-dot",
        "e-t-e-text",
        "e-t-e-cell",
      ];
      if (!whiteList.some((v) => name.includes(v))) {
        this.showEditor = false;
        this.showText = false;
      }
    },
    moveTo(e, params) {
      this.showText = false;
      this.showEditor = true;
      const target = e.target;
      this.editorStyle = {
        left: target.offsetLeft + "px",
        top: target.offsetTop + "px",
        width: target.clientWidth + "px",
        height: target.clientHeight + "px",
      };
      this.inputValue = params[2];
      this.position = params.slice(0, 2);
    },
    getFocus() {
      this.showText = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
        this.$refs.input.select();
      });
    },

    onInput() {
      const [row, colomn] = this.position;
      if (this.tableData[row]) {
        this.tableData[row][colomn] = this.inputValue;
      } else {
        this.$set(this.tableData, row, []);
        this.tableData[row][colomn] = this.inputValue;
      }
    },

    xEnter(e, idx) {
      const TABLE = document.querySelector(".excel-table-inner");
      const height = TABLE.clientHeight;
      const target = e.target;
      target.style.height = height + "px";
      this.xActive = idx;
    },

    xLeave(e) {
      e.target.style.height = "30px";
      this.xActive = -1;
    },

    xDragStart(e, idx) {
      this.showText = false;
      this.showEditor = false;
      const startX = e.pageX;
      const COL = document.getElementsByClassName("e-t-e-col")[idx];
      const initialWidth = COL.clientWidth;
      document.onmousemove = (evt) => {
        const diffX = evt.pageX - startX + initialWidth;
        const finalX = diffX < 70 ? 70 : diffX;
        console.log(evt.pageX - startX);
        COL.style.width = finalX + "px";
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },

    yEnter(e, idx) {
      const TABLE = document.querySelector(".excel-table-inner");
      const width = TABLE.clientWidth;
      const target = e.target;
      target.style.width = width + "px";
      this.yActive = idx;
    },

    yLeave(e) {
      e.target.style.width = "100%";
      this.yActive = -1;
    },

    yDragStart(e, idx) {
      this.showText = false;
      this.showEditor = false;
      const startY = e.pageY;
      const ROW = document.getElementsByClassName("e-t-e-row")[idx];
      const initialHeight = ROW.clientHeight;
      document.onmousemove = (evt) => {
        const diffY = evt.pageY - startY + initialHeight;
        const finalY = diffY < 30 ? 30 : diffY;
        ROW.style.height = finalY + "px";
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },

    contextMenu(e, { type, idx }) {
      if (type === "col" && idx === 0) return;
      this.contextType = type;
      this.contextIdx = idx;
      const { clientX, clientY } = e;
      const finalX =
        clientX + 140 > window.innerWidth ? window.innerWidth - 140 : clientX;
      const finalY =
        clientY + 256 > window.innerHeight ? window.innerHeight - 256 : clientY;
      this.contextStyle = {
        left: finalX + "px",
        top: finalY + "px",
      };
      this.showContext = true;
    },

    contextHandler(type) {
      switch (type) {
        case "left-add":
          this.tableData.forEach((v) => {
            v.splice(this.contextIdx - 1, 0, "");
          });
          this.tableData = this.tableData.slice();
          break;
        case "del-col":
          this.tableData.forEach((v) => {
            v.splice(this.contextIdx - 1, 1);
          });
          this.tableData = this.tableData.slice();
          break;
        case "right-add":
          this.tableData.forEach((v) => {
            v.splice(this.contextIdx, 0, "");
          });
          this.tableData = this.tableData.slice();
          break;
        case "up-add":
          this.tableData.splice(this.contextIdx, 0, []);
          break;
        case "del-row":
          if (this.tableData[this.contextIdx]) {
            this.tableData.splice(this.contextIdx, 1);
          }
          break;
        case "down-add":
          this.tableData.splice(this.contextIdx + 1, 0, []);
          break;
        default:
          break;
      }
    },

    importFile({ onChange }) {
      return new Promise((resolve, reject) => {
        try {
          chooseFile().then((file) => {
            onChange && onChange();
            readFile(file).then((data) => {
              const tableData = getArrayData(data);
              this.tableData = tableData;
              resolve();
            });
          });
        } catch (e) {
          reject(e);
        }
      });
    },

    exportFile(title = "未命名") {
      return new Promise((resolve, reject) => {
        try {
          exportFile(this.tableData, title);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    },

    getData() {
      return this.tableData;
    },

    setData(data) {
      if (Array.isArray(data)) {
        this.tableData = data;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.vue-excel-cell {
  position: relative;
  .excel-table-editor {
    position: absolute;
    width: 70px;
    height: 30px;
    left: 1px;
    top: 1px;
    border: 2px solid rgb(108, 143, 108);
    box-sizing: border-box;
    font-size: 0;
    z-index: 10;
    .e-t-e-dot {
      position: absolute;
      right: -2px;
      bottom: -2px;
      display: inline-block;
      width: 5px;
      height: 5px;
      background-color: rgb(108, 143, 108);
      border-top: 2px solid white;
      border-left: 2px solid white;
      z-index: 1;
      cursor: auto;
    }
    .e-t-e-text {
      width: 100% !important;
      height: 100% !important;
      outline: 0;
      box-sizing: border-box;
      border: 0;
      font-size: 1rem;
      resize: none;
      padding: 0;
    }
  }
  .width-editor {
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background-color: green;
  }
  .excel-table-inner {
    border-collapse: collapse;
    table-layout: fixed;
    width: 0;
    user-select: none;
    font-size: 14px;
    border-left: 1px solid #e8e8e8;
    border-top: 1px solid #e8e8e8;
    thead {
      background: #f5f5f5;
    }
    td,
    th {
      text-align: center;
      box-sizing: border-box;
      padding: 0;
      position: relative;
      border-right: 1px solid #e8e8e8;
      border-bottom: 1px solid #e8e8e8;
      vertical-align: middle;
      &.cell-active {
        background-color: rgb(108, 143, 108);
        color: white;
      }
      &.no-select {
        user-select: none;
        -ms-user-select: none;
      }
      .resize-line-vertical {
        position: absolute;
        top: 0;
        right: -3px;
        width: 4px;
        padding: 0 2px;
        display: inline-block;
        height: 30px;
        cursor: col-resize;
        &.line-active {
          background-color: rgb(108, 143, 108);
        }
      }
    }

    td {
      cursor: cell;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    tr {
      height: 30px;
      .e-row-title {
        position: relative;
        overflow: visible;
        font-weight: 600;
        .resize-line-horizontal {
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 100%;
          padding: 2px 0;
          display: inline-block;
          height: 4px;
          cursor: row-resize;
          &.line-active {
            background-color: rgb(108, 143, 108);
          }
        }
      }
    }
  }
  .e-context-menu {
    position: fixed;
    left: 0;
    top: 0;
    background-color: white;
    width: 120px;
    height: 236px;
    box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    margin: 0;
    padding: 10px 0;
    list-style: none;
    z-index: 10;
    box-sizing: border-box;
    .menu-disabled {
      color: rgb(190, 190, 190);
      li {
        cursor: not-allowed;
        &:hover {
          background-color: white;
        }
        &:active {
          background-color: white;
        }
      }
    }
    li {
      font-size: 12px;
      padding: 10px 20px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: #eee;
      }
      &:active {
        background-color: rgb(216, 216, 216);
      }
    }
  }
}
</style>