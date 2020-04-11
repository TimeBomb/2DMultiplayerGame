import * as http from 'http';
import Koa from 'koa';
import serve from 'koa-static';
import * as fs from 'fs';
import { sep } from 'path';

const app = new Koa();

app.use(serve(`${__dirname}${sep}public`));

app.use(async (ctx, next) => {
	await next();

	const html = fs.readFileSync(`${__dirname}${sep}game.html`, { encoding: 'utf8' });
	ctx.body = html;
});

http.createServer(app.callback()).listen(3000);
console.log('server started on http://localhost:3000');
