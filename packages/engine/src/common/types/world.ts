export type Coords = { x: number; y: number };
export type Size = { width: number; height: number };
export type StaticTilemapLayer = {
	tilemap: {
		width: number;
		height: number;
		tileWidth: number;
		tileHeight: number;
		getTileAt: (x: number, y: number) => any;
	};
};
