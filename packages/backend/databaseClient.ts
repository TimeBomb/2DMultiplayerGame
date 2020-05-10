// TODO: Tie in a real underlying database here, perhaps Redis
// Currently just a simple state store
export default class DatabaseClient {
	store: { [index: string]: any } = {};

	get(key: string) {
		return this.store[key];
	}

	set(key: string, value: any) {
		this.store[key] = value;
	}
}
