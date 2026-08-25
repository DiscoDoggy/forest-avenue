# Forest Avenue
## What
Forest Avenue is the first mobile app that can connect to GPS and a car's electronic control unit (ECU, the brain of the car) to calculate and record real-time miles per gallon (MPG). The instantaneous MPG,
as opposed to only calculating MPG by hand when the fuel tank hits half or close to empty, allows users to gain insights about how efficient each individual trip they have taken was, where on the trip their car got the best MPG
and the worst MPG via looking at their trip efficiency map which shows color coded segments of the users route corresponding to the efficiency they were getting while driving that particular segment, 
how much that trip cost based on regional fuel prices, and more.

## How
Forest Avenue is written in React Native. The decision to develop in React Native, as opposed to developing a native Android and native IOS version independently, is two fold. First is about development speed. It is much 
faster to develop in a single codebase and maintain that codebase than it might be to maintain two independent codebases. I also believe the app's complexity will not grow into requiring manual native interventions that Expo cannot provide (famous last words)
Second, I do not possess the computational resources to run Android Studio (my laptop isn't powerful enough lmao) and I do not own an Apple device to continuously test. As a result, there is focus on Android use first because I use Android.

### Connecting to the Car and MPG
The connection to the car's ECU is done through bluetooth OBD-II. We connect to the OBD-II device through utilizing [@kenjdavidson's RN-Bluetooth-Classic library](https://github.com/kenjdavidson/react-native-bluetooth-classic)
and we write our own OBDII client layer so we can query the OBDII device. Following the trend of Android first, many bluetooth OBD-II dongles still only use bluetooth classic 
as opposed to bluetooth low energy and Android still strongly supports the bluetooth classic protocol while IOS devices do not have as strong support. A separate bluetooth low energy implementation will need to be created and injected for full IOS compatibility.

A car's OBDII works on a request and response model. OBDII client requests a specific PID and the OBDII requests that information from the car's ECU.
To calculate MPG, we query from the car's ECU multiple times per second mass airflow (MAF), vehicle speed (VSS), and have been exploring utilizing long term fuel trims (LTFT) and short term fuel trims (STFT).

### Mapping real-time MPG 
The connection and querying of a car's ECU and the GPS recording module are implemented as separate independent services. This data is fed into a class which holds the responsibility of aggregating and pairing together the
MPG and GPS information. We need to display this information onto a map while a user is potentially driving so they can see how efficient their route is. For mapping, we utilize [React Native Mapbox](https://github.com/rnmapbox/maps).
When researching, React Native Mapbox had the cleanest looking UI features, high level of customization, a plethora of APIs to do map related things such as generating map thumbnails, and a generous free tier compared to other mapping platforms.
Because we want the map/UI to update as more MPG and GPS recordings arrive, we need some sort of UI state management. We choose Zustand over other state management libraries for the simplicity in its subscriber model. UI components can
subscribe to as large or as small of data units that the UI needs avoiding large scale re-renders when only a little data changes. The UI subscribes to various Zustand stores and the aggregation class updates these states allowing the user to see changes to their MPG and movement on the map in near real-time.

### Storage
Once a trip is finished, the data is stored in an on-device SQLite database. We choose SQLite because using trip data a lot of analytics can be produced and running that through SQL queries compared to application code 
can be both a cleaner set of responsibilities and potentially faster due to the SQLite query optimizer.  

### Using Trip Data
We store trip data so users can view past trips and the various statistics related to a trip. When a user taps on a particular past trip, they will see the route they took on a map with color coded line segments indicating
fuel economy in that segment. There will be several statistic cards detailing how far their trip was, their MPG, how much fuel they consumed, the cost of the trip, average cost per mile, etc. User's will also have a more 
aggregated view where they can view these statistics in terms of 1 week, 1 month, 3 months, 1 year, YTD, and all time timeframes to get a good idea of how much fuel and money was spent and consumed on driving trips in these time periods

## Future work
This application is STRONGLY in development. So far, the mapping, storage, trip data uses, and connecting to the car which are the core features are implemented but the UI and stability could easily use additional work. 
As the app progresses, requiring a user to have an OBD-II device is one of the requirements I want to phase out. Using GPS data such as acceleration, altitude, speed, the car's engine size, if its a hybrid or not, and the ground truth
MPGs I want to train ML models that can perform the MPG predictions instead of relying on an OBD-II to get car sensor data.


