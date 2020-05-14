import redis from 'redis';

import { DATABASE_HOST } from './config';

// TODO: Update to support config options for different envs
export default (function () {
	return redis.createClient({
		host: DATABASE_HOST,
	});
})();
