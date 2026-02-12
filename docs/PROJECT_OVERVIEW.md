# KyberVision23 Project Overview

This project is a platform supporting the Kyber Vision mobile application. It is a web application that allows users to view and manage their data collected from the mobile application.

The mobile application tool used for data collection. Users who watch live matches or review video matches can use the mobile application that allows them to record actions occuring during the match.

The API is built using ExpressJS, formerly called KyberVision22API. The web-manager is built using NextJS, formerly called KyberVision22Manager. The database is built using Node and Sequelize ORM to communicate with a sqlite database. The database/ directory is imported from the project formerly called KyberVision22Db. This KyberVision22Db was imported into the API and other services.

The project also used a KyberVision22Queuer which is an ExpressJS application that uses BullMQ to manage a queue of jobs. It would run other services as child processes. These child processes were KyberVision22VideoMontageMaker and KyberVision22YouTubeUploader.

## Migrating KyberVision22Queuer

The KyberVision22Queuer is now moved to the worker-node/ subproject directory. It is will be its own service that will instead of running the child processes, we will want to migrate the KyberVision22VideoMontageMaker and KyberVision22YouTubeUploader into the worker-node/ subproject directory as well. The worker-node/ will be an API / BullMQ service that will queue the jobs and process the functionalities that KyberVision22VideoMontageMaker and KyberVision22YouTubeUploader were doing a child processes.

### KyberVision22VideoMontageMaker

Is found in /Users/nick/Documents/KyberVision22VideoMontageMaker. A microservice that generates video montages by extracting clips from a source video based on specified timestamps and merging them into a final video.

### KyberVision22YouTubeUploader

Is found in /Users/nick/Documents/KyberVision22YouTubeUploader.
