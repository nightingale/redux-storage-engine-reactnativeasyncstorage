import { AsyncStorage } from 'react-native';

var splitString = function(string, size) {
  var re = new RegExp('.{1,' + size + '}', 'g');
  return string.match(re);
}

export default (key) => ({
    load() {
        window.storeCurrentKey = key;

        let loadedState = {};

        return new Promise(function(resolve, reject) {
          window.globalResolve = resolve;
          window.globalReject = reject;
          AsyncStorage.getAllKeys().then((keys) => {
            window.storeKeys = keys;
            AsyncStorage.multiGet(keys).then((jsonStateArray) => {
              for (var i = 0; i < jsonStateArray.length; i ++) {
                var jsonState = jsonStateArray[i][1];
                var currentKey = jsonState.slice(0, 8);
                var value = jsonState.substring(8);
                loadedState[parseInt(currentKey)] = value;
              }
              // Now we have everything let's merge
              var jsonString = '';
              for (var i = 0; i < Object.keys(loadedState).length; i ++) {
                jsonString = jsonString + loadedState[i];
              }
              window.globalResolve(JSON.parse(jsonString));
            });
          });
        });
    },

    save(state) {
        state.data.data.currentRouter = {};
        const jsonState = JSON.stringify(state);
        var chunkSize = 1000000; // Roughly the maximum that Android can handle

        return new Promise(function(resolve, reject) {
          window.globalSaveResolve = resolve;
          window.globalSaveReject = reject;

          AsyncStorage.clear().then(() => {
            var chunkedArray = splitString(jsonState, chunkSize);
            var multiSet = [];
            for (var i = 0; i < chunkedArray.length; i ++) {
              paddedStart = `${i}`;
              while (paddedStart.length < 8) paddedStart = "0" + paddedStart;
              multiSet.push([`${key}+${i}`, paddedStart + chunkedArray[i]]);
            }
            AsyncStorage.multiSet(multiSet);
            window.globalSaveResolve(true);
          });;
        });
    }
});
