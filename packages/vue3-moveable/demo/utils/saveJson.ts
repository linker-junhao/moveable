
const filenameWithDate = (name: string) => {
  const d = new Date()
  return `${name}_${d.getFullYear()}${d.getMonth()}${d.getDate()}${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}.json`
}

const saveJSONFile = (jsonData = {}, name = '') => {
  const data = JSON.stringify(jsonData);
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name || filenameWithDate('json');
  a.click();
  URL.revokeObjectURL(url);
};


export {
  saveJSONFile,
  filenameWithDate
}