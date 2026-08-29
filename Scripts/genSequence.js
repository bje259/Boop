
/**
	{
		"api":1,
		"name":"Generate sequence",
		"description":"Generates a sequence",
		"author":"Me",
		"icon":"broom",
        "tags":"place,tags,here",
        "bias":0.0
	}
**/

function main(state) {
	try {
        
        /*
        The 'state' object has three properties to deal with text: text, fullText, and selection.

        state.fullText will contain or set the entire string from the Boop editor, regardless of whether a selection is made or not.
        state.selection will contain or set the currently selected text, one at a time if more that one selection exists.
        state.text will behave like selection if there is one or more selected piece of text, otherwise it will behave like fullText.
        */

		//state.fullText = state.selection; // Remove all but selected text
        let multiline = state.selection.split('\n').length > 1;
        let multiArgs = []
        let resultset = [];
        if (multiline) {
            multiArgs = state.selection.split('\n').map(line => line.trim());
            multiArgs = multiArgs.filter(line => line.length > 0); // Remove empty lines
            if (multiArgs.length === 0) {
                state.postError("Please provide at least one line of input.");
                return;
            }
        } else {
            multiArgs = [state.selection.trim()];
        }
        for (let argset of multiArgs) {
            let rawargs = argset.replace(/["'],["']/g, "comma").replace(/\\,/g, "comma");
            rawargs = rawargs.replace(/["']\s+["']/g, "space").replace(/\\\s/g, "space");
            rawargs = rawargs.replace(/'/g, '').replace(/"/g, '').trim();
            let args = rawargs.split(/[\s,]+/);

            if (args.length < 3) {
                state.postError("Please provide start, end, and step values separated by commas.");
                return;
            }
            let start = parseInt(args[0].trim());
            let end = parseInt(args[1].trim());
            let step = parseInt(args[2].trim());
            let prefix = (args.length == 5) ? args[4].trim() : '';

            if (isNaN(start) || isNaN(end) || isNaN(step)) {
                state.postError("Invalid input. Please provide valid numbers for start, end, and step.");
                return;
            }
            
            function* genSequence(start, end, step) {
                for (let i = start; i <= end; i += step) {
                    yield i;
                }
            }
            let sequence = Array.from(genSequence(start, end, step));
            if (prefix) {
                sequence = sequence.map(num => prefix + num);
            }
            if (args.length >= 4) {
                let delimiter = args[3].trim().replace(/comma/g, ',').replace(/space/g, ' ');
                if (delimiter) {
                    resultset.push(sequence.join(delimiter));
                }
            } else {
                resultset.push(sequence.join(", "));
            }
            //state.postInfo(`seq:  start:${start} end:${end} step:${step}`);
        }
        state.selection = resultset.join('\n');
    }
	catch(error) {
		state.postError(error.message)
	}
	
}