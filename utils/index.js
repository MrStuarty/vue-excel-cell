import XLSX from "xlsx";
const { utils } = require("codepage/dist/cpexcel.full.js");

export function chooseFile(ext = ".xlsx,.xls,.csv") {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ext;
    input.onchange = () => {
      const file = input.files[0];
      const fileExt = getFileExt(file);
      if (ext.indexOf(fileExt) < 0) {
        reject("请上传支持的格式");
        return;
      } else {
        resolve(file);
      }
    };
    input.click();
  });
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    let isCSV = false;
    fileReader.onload = (res) => {
      let data = res.target.result;
      let workbook = null;
      let output = [];
      let fromTo = "";
      if (isCSV) {
        data = new Uint8Array(data);
        var str = utils.decode(936, data);
        workbook = XLSX.read(str, { type: "string" });
      }
      if (!workbook) {
        workbook = XLSX.read(btoa(fixdata(data)), { type: "base64" });
      }
      // 表格的表格范围，可用于判断表头是否数量是否正确
      // 遍历每张表读取
      for (var sheet in workbook.Sheets) {
        if (workbook.Sheets.hasOwnProperty(sheet)) {
          fromTo = workbook.Sheets[sheet]["!ref"];
          output = output.concat(
            XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
          );
          // break; // 如果只取第一张表，就取消注释这行
        }
      }
      resolve(output);
    };
    isCSV = getFileExt(file) === "csv"; //判断是否是 CSV
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
}

export function getFileExt(file) {
  return file.name.split(".").pop();
}

export function fixdata(data) {
  //文件流转BinaryString
  var o = "",
    l = 0,
    w = 10240;
  for (; l < data.byteLength / w; ++l)
    o += String.fromCharCode.apply(
      null,
      new Uint8Array(data.slice(l * w, l * w + w))
    );
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
  return o;
}

export function getArrayData(data) {
  const arr = [];
  const keys = Object.keys(data[0]);
  arr.push(keys);
  data.forEach((v) => {
    arr.push(Object.values(v));
  });
  return arr;
}

export function exportFile(data, title) {
  const wb = XLSX.utils.book_new();

  const header = data[0];

  const mapped = data
    .slice(1)
    .filter((v) => v.length > 0)
    .map((rec) => {
      const conv = {};
      header.forEach((name, i) => (conv[name] = rec[i]));
      return conv;
    });

  const worksheet = XLSX.utils.json_to_sheet(mapped, { header });

  XLSX.utils.book_append_sheet(wb, worksheet, "Sheet1");

  const filename = title + ".xlsx";

  XLSX.writeFile(wb, filename, {
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });
}
