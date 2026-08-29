// @ts-check
/**
{
  "api":1,
  "name":"Convert to pretty markdown table",
  "description":"Converts csv, tsv or markdown table into pretty markdown table format.",
  "author":"xshoji",
  "icon":"term",
  "tags":"csv,tsv,md,markdown"
}
**/
const calcByWidth = true;

/** @type {string} test */
var test = "hello";
// @ts-expect-error
test = 3
/** @type {number} */
var testtype = (typeof test === 'number') ? test : -1;
console.log(typeof testtype);
console.log(`${test}`);

const fnA = function () {
/** @type {string|number} test */
var test = "hello";
test = 3;
/** @type {number} */
// @ts-check
var testtype = test;
console.log(typeof testtype);
console.log(`${test}`);
return testtype;
};

const fnB = function () {
/** @type {string} test */
var test = "hello";
// @ts-expect-error
test = 3; //no error shows
/** @type {number} */
// @ts-expect-error
var testtype = test; //error shows here
console.log(typeof testtype);
console.log(`${test}`);
return testtype;
};

const fnC = function () {
/** @type {string} test */
var test = "hello";
// @ts-expect-error
test = 3; //no error shows
/** @type {number} */
// @ts-expect-error
var testtype = test; //no error shows
console.log(typeof testtype);
console.log(`${test}`);
return testtype;
};

const fnD = function () {
/** @type {string} test */
var test = "hello";
// @ts-expect-error
test = 3;
/** @type {number} */
var testtype = (typeof test === 'number') ? test : -1; //no error shows, but would have if I left ts-expect-error
console.log(typeof testtype);
console.log(`${test}`);
return testtype;
};

console.log(fnA());
console.log(fnB());
console.log(fnC());
console.log(fnD());

function main(input) {
  input.text = convertToPrettyMarkdownTableFormat(input.text);
}
/**
 * Converts a CSV, TSV, or markdown table into a pretty markdown table format.
 * @param {string} input - The input text to convert.
 * @returns {string} - The converted pretty markdown table.
 */
function convertToPrettyMarkdownTableFormat(input) {
  const list = input.trim().replace(/^(\r?\n)+$/g, "\n").split("\n").map(v => v.replace(/^\||\|$/g, ""));
  /** @type {string} */
  // @ts-expect-error
  const delimiter = [`|`, `\t`, `","`, `,`].find(v => list[0].split(v).length > 1);
  if (delimiter === `|`) {
    // If input text is markdown table format, removes header separator.
    list.splice(1, 1);
  }
  const tableElements = list.map(record => record.split(delimiter).map(v => v.trim()));
  const calcWidth = (str) => str.length;
  const calcBytes = (character) => {
    let length = 0;
    for (let i = 0; i < character.length; i++) {
      const c = character.charCodeAt(i);
      // Multibyte handling
      (c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4) ? length += 1 : length += 2;
    }
    if (calcByWidth) return calcWidth(character);
    return length;
  };
  
  const columnMaxLengthList = tableElements[0].map((v, i) => i).reduce((map, columnIndex) => {
    let maxLength = 0;
    tableElements.forEach(record => maxLength < calcBytes(record[columnIndex]) ? maxLength = calcBytes(record[columnIndex]) : null);
    if (maxLength === 1) {
      // Avoids markdown header line becomes only ":" ( ":-" is correct. ).
      maxLength = 2;
    }
    map[columnIndex] = maxLength;
    return map;
  }, {})
  const formattedTableElements = tableElements.map(record => record.map((value, columnIndex) => value + "".padEnd(columnMaxLengthList[columnIndex] - calcBytes(value), " ")));
  const headerValues = formattedTableElements.shift();
  // @ts-ignore
  const tableLine = headerValues.map(v => "".padStart(calcBytes(v), "-").replace(/^./, ":"));
  formattedTableElements.unshift(tableLine);
  // @ts-ignore
  formattedTableElements.unshift(headerValues);
  return formattedTableElements.map(record => "| " + record.join(" | ") + " |").join("\n");
}
