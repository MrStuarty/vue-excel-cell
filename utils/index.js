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
        const is_utf8 = isUTF8(data);
        if (is_utf8) {
          data = res.target.result;
        } else {
          var str = utils.decode(936, data);
          workbook = XLSX.read(str, { type: "string" });
        }
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

function isUTF8(bytes) {
  //非中文格式CSV文件转换UTF-8方法
  var i = 0;
  while (i < bytes.length) {
    if (
      // ASCII
      bytes[i] == 0x09 ||
      bytes[i] == 0x0a ||
      bytes[i] == 0x0d ||
      (0x20 <= bytes[i] && bytes[i] <= 0x7e)
    ) {
      i += 1;
      continue;
    }

    if (
      // non-overlong 2-byte
      0xc2 <= bytes[i] &&
      bytes[i] <= 0xdf &&
      0x80 <= bytes[i + 1] &&
      bytes[i + 1] <= 0xbf
    ) {
      i += 2;
      continue;
    }

    if (
      // excluding overlongs
      (bytes[i] == 0xe0 &&
        0xa0 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf) || // straight 3-byte
      (((0xe1 <= bytes[i] && bytes[i] <= 0xec) ||
        bytes[i] == 0xee ||
        bytes[i] == 0xef) &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf) || // excluding surrogates
      (bytes[i] == 0xed &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0x9f &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf)
    ) {
      i += 3;
      continue;
    }

    if (
      // planes 1-3
      (bytes[i] == 0xf0 &&
        0x90 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf &&
        0x80 <= bytes[i + 3] &&
        bytes[i + 3] <= 0xbf) || // planes 4-15
      (0xf1 <= bytes[i] &&
        bytes[i] <= 0xf3 &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf &&
        0x80 <= bytes[i + 3] &&
        bytes[i + 3] <= 0xbf) || // plane 16
      (bytes[i] == 0xf4 &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0x8f &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf &&
        0x80 <= bytes[i + 3] &&
        bytes[i + 3] <= 0xbf)
    ) {
      i += 4;
      continue;
    }
    return false;
  }
  return true;
}
