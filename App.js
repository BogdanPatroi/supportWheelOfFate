import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';

// import data (workers and days)
import Data from './data.json';

export default function App() {
  // state
  const [shifts, setShifts] = useState(null);

  // where the magic happens
  let getTwoNonConsecutiveDays = () => {
    const days = Data.days;
    const workers = Data.workers;

    // First step: assign a random worker for each day
    let randomWorker = (workers, days) => {
      // destructuring assignment to unpack values from arrays, or properties from objects, into distinct variables.
      const daysCopy = { ...days };
      const workersCopy = [...workers];

      // for each day, a worker will be asign
      Object.keys(daysCopy).forEach((key) => {
        // The Math.floor() function returns the largest integer less than or equal to a given number
        // The Math.random() function returns a pseudo-random number in the range 0 to less than 1
        const random = Math.floor(Math.random() * workersCopy.length);
        // console.log("random", random);

        // The splice() method changes the contents of an array 
        // by removing or replacing existing elements and/or adding new elements in place.
        // adding a random worker in a day element 
        daysCopy[key] = [workersCopy.splice(random, 1)[0]];
        // console.log("daysCopy[key]", daysCopy[key]);
      })

      // console.log("days", days);
      // console.log("daysCopy", daysCopy);
      // console.log("workers", workers);
      // console.log("workersCopy", workersCopy);

      return availableWorkers(workers, daysCopy);
    }

    // Second step: determine what workers are available for each remaining slot
    let availableWorkers = (workers, days) => {

      const workerMap = {};
      // key = workers
      Object.keys(days).forEach((key, index) => {
        const current = days[key][0];
        const prev = days[Object.keys(days)[index - 1]] ? days[Object.keys(days)[index - 1]][0] : null;
        const next = days[Object.keys(days)[index + 1]] ? days[Object.keys(days)[index + 1]][0] : null;
        const allowed = workers.filter((worker) => [current, prev, next].indexOf(worker) < 0,);
        workerMap[key] = allowed;

        // console.log("daysKey:", days[key]);
        // console.log("current:", current);
        // console.log("prev:", prev);
        // console.log("next:", next);
        // console.log("allowed:", allowed);
        // console.log("workerMap[key]:", workerMap[key]);
      });
      return assignWorkers(days, workerMap);
    };

    //assign randomly workers
    let assignWorkers = (days, workerMap) => {
      //create copy for push mutation
      const daysCopy = { ...days };
      //create copy for delete mutation
      let mapCopy = { ...workerMap };
      //while there remains available workers
      while (Object.keys(mapCopy).length) {
        //store keys for days with available workers
        const keys = Object.keys(mapCopy);
        //create object map for length of available workers per day
        const lengths = {};
        Object.keys(mapCopy).forEach((key) => {
          lengths[key] = mapCopy[key].length;
        });
        //find the day with the least amount of options as this guarantees less chance of failure
        const shortestVal = Object.values(lengths).sort((a, b) => a - b)[0];
        const shortestKey = keys.find((key) => lengths[key] === shortestVal);

        //randomly select an available option for the shortest day
        const options = mapCopy[shortestKey];
        const random = Math.floor(Math.random() * options.length);
        const selection = options[random];

        //if the assignment fails, it will recursively call itself; this occurs about 2% of the time
        if (typeof selection === 'undefined') return assignWorkers(days, workerMap);
        //otherwise push the selection as the second worker for the day
        daysCopy[shortestKey] = [...daysCopy[shortestKey], selection];
        //remove worker from being placed in other days
        keys.forEach((key) => {
          mapCopy[key] = mapCopy[key].filter((worker) => worker !== selection);
        });
        //delete day that already was filled with workers
        delete mapCopy[shortestKey];
      };
      // return JSON with days assosciated with workers
      return daysCopy;
    };

    const result = JSON.stringify(randomWorker(workers, days), null, '\t');
    return setShifts(result);
  };

  return (
    <View style={styles.container}>
      <TouchableHighlight
        onPress={getTwoNonConsecutiveDays}>
        <Text>Click Here!</Text>
      </TouchableHighlight>
      <View>
        <Text>{shifts}</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
