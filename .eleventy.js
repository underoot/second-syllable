const fs = require('fs');
const htmlmin = require('html-minifier');
const markdown = require('markdown-it')({ html: true });
const music = require('music-metadata');
const prettydata = require('pretty-data');

module.exports = (config) => {
	config.addFilter('length', (path) => {
		const stats = fs.statSync(path);
		return stats.size;
	});

	const getDuration = async (path) => {
		const metadata = await music.parseFile(path);
		const duration = parseFloat(metadata.format.duration);

		return new Date(Math.ceil(duration) * 1000).toISOString().substr(11, 8);
	}

	config.addNunjucksAsyncFilter('duration', async (path, callback) => {
		callback(null, await getDuration(path));
	});

	config.addFilter('ruDate', (value) => {
		return value.toLocaleString('ru', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).replace(' г.', '');
	});

	config.addFilter('htmlmin', (value) => {
		return htmlmin.minify(
			value, {
				removeComments: true,
				collapseWhitespace: true
			}
		);
	});

	config.addTransform('xmlmin', (content, outputPath) => {
		if(outputPath && outputPath.endsWith('.xml')) {
			return prettydata.pd.xmlmin(content);
		}
		return content;
	});

	return {
		dir: {
			input: 'src',
			output: 'dist',
			includes: 'includes',
			data: 'data'
		},
		dataTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk'
	};
};
