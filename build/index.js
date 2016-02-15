import { AsyncStorage } from 'react-native';
import CircularJSON from './circular-json';

export default (key) => ({
    load() {
        return AsyncStorage.getItem(key)
            .then((jsonState) => CircularJSON.parse(jsonState) || {});
    },

    save(state) {
        const jsonState = CircularJSON.stringify(state);
        return AsyncStorage.setItem(key, jsonState);
    }
});
