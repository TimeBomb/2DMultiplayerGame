import browserify from 'browserify';
import tsify from 'tsify';
import { sep, resolve } from 'path';
import unassertify from 'unassertify';
import envify from 'envify';
import uglifyify from 'uglifyify';
import shakeify from 'common-shakeify';
import minifyStream from 'minify-stream';
import * as fs from 'fs';
import { program } from 'commander';
import * as process from 'process';

const OUTPUT_FILE_NAME = 'game.js';
const OUTPUT_FOLDER = resolve(__dirname, '../web/public/js');

program.option('-d --dev', 'does not minify bundle');
program.parse(process.argv);

async function compile(outputFolder) {
	const outputFile = `${outputFolder}${sep}${OUTPUT_FILE_NAME}`;
	const bundleWriteStream = fs.createWriteStream(outputFile);

	console.log('Building...');
	const startTime = new Date();
	let bundler = browserify(`${__dirname}${sep}..${sep}engine/src/client/main.ts`).plugin(tsify, {
		esModuleInterop: true,
	});
	if (!program.dev) {
		bundler = bundler
			.transform(unassertify, { global: true })
			.transform(envify, { global: true })
			.transform(uglifyify, { global: true })
			.plugin(shakeify)
			.bundle()
			.pipe(minifyStream({ sourceMap: false }));
	} else {
		bundler = bundler.bundle();
	}

	bundler.pipe(bundleWriteStream);

	bundleWriteStream.on('finish', () => {
		const endTime = new Date();

		const secondsElapsed = (endTime.getTime() - startTime.getTime()) / 1000;
		console.log(`Finished building bundle to ${outputFile} in ${secondsElapsed}s`);
	});
}

compile(OUTPUT_FOLDER);
