/**
	{
		"api":1,
		"name":"tmp test",
		"description":"Search for a regex pattern in the text, then replace it.",
		"author":"bje",
		"icon":"elephant",
		"tags":"regex,search,substitution"
	}
**/

function main(state) {
	try {
		let testresult = {};
        const yaml = require('@boop/js-yaml');
		const input = state.text;
		const parsed = yaml.load(input);
        testresult = {
            parsed: parsed,
            input: input,
            type: typeof parsed,
            isArray: Array.isArray(parsed),
            isObject: typeof parsed === 'object' && !Array.isArray(parsed),
        };
        const hashes = require('@boop/hashes');
        testresult.hashes = {
            md5: new hashes.MD5().hex("secret"),
            sha256: new hashes.SHA256().hex("secret")
};
        const _ = require('@boop/lodash.boop');
        testresult.lodash = {
            camelCase: _.camelCase("hello world"),      // "helloWorld"
            kebabCase: _.kebabCase("Hello World"),      // "hello-world"
            snakeCase: _.snakeCase("Hello World"),      // "hello_world"
            startCase: _.startCase("helloWorld"),       // "Hello World"
            deburr: _.deburr("déjà vu"),             // "deja vu"
            escapeRegExp: _.escapeRegExp("a+b*c"),         // "a\+b\*c"
            size: _.size({a: 1, b: 2})            // 2
        };

        const Papa = require('@boop/papaparse');
        const csv = 'name,age\nAlice,30\nBob,25';
        const result = Papa.parse(csv, { header: true });
        testresult.csv = {
            csv: csv,
            parsed: result.data
        };
		state.text = JSON.stringify(testresult, null, 2);
	} catch (e) {
		state.postError(e.message);
	}
}