import Connection from './Connection';

export default {
    createConnection: (config) => {
        if (!config) {
            throw new Error('Configuration object is required.');
        }

        return new Connection(config);
    }
};
