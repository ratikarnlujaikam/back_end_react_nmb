var array = [
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6]
];
var option = [];

for (let i = 0; i < array.length; i++) {
  option.push({ data: array[i] });
}

console.log(option);
