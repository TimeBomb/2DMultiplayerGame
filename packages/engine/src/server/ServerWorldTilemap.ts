import { readFileSync } from 'fs';
import { join } from 'path';

import { StaticTilemapLayer } from '../common/types/world';

export default class ServerWorldTilemap {
	tilemapFilePath = join(__dirname, '/../../../web/public/assets/tilemaps/map.json');
	tilemap;
	collisionLayer: StaticTilemapLayer;
	collisionLayerData: number[];
	collisionByExclusion: number[];

	constructor(collisionByExclusion: number[]) {
		this.collisionByExclusion = collisionByExclusion;

		const tilemapFileContents = readFileSync(this.tilemapFilePath, { encoding: 'utf8' });
		this.tilemap = JSON.parse(tilemapFileContents);
		const collisionLayer = this.tilemap.layers.find(
			(layer) => layer.name.toLowerCase() === 'collision',
		);

		this.collisionLayerData = collisionLayer.data;
		this.collisionLayer = {
			tilemap: {
				width: collisionLayer.width,
				height: collisionLayer.height,
				tileWidth: this.tilemap.tilesets[0].tilewidth,
				tileHeight: this.tilemap.tilesets[0].tileheight,
				getTileAt: this.getTileAt.bind(this),
			},
		};

		this.collisionLayerData = this.parseTilemapData(collisionLayer.data);
	}

	getTileAt(x: number, y: number): any {
		const tileNumber = this.collisionLayerData[y][x];
		if (!tileNumber) return;

		return {
			canCollide: !this.collisionByExclusion.includes(tileNumber),
		};
	}

	parseTilemapData(data: number[]) {
		const output = [];

		let x = 0;
		let row = [];
		for (let i = 0, len = data.length; i < len; i++) {
			const tile = data[i];
			row.push(tile);

			x++;
			if (x === this.collisionLayer.tilemap.width) {
				x = 0;
				output.push(row);
				row = [];
			}
		}

		return output;
	}
}
