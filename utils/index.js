import XLSX from "xlsx";

export function chooseFile(ext = ".xlsx,.xls,.csv") {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ext;
    input.onchange = () => {
      const file = input.files[0];
      const fileExt = file.name.split(".").pop();
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
    fileReader.onload = (res) => {
      const workbook = XLSX.read(res.target.result, { type: "buffer" });
      let persons = [];
      // 表格的表格范围，可用于判断表头是否数量是否正确
      var fromTo = "";
      // 遍历每张表读取
      for (var sheet in workbook.Sheets) {
        if (workbook.Sheets.hasOwnProperty(sheet)) {
          fromTo = workbook.Sheets[sheet]["!ref"];
          persons = persons.concat(
            XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
          );
          // break; // 如果只取第一张表，就取消注释这行
        }
      }
      resolve(persons);
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
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

  console.log(mapped);

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
