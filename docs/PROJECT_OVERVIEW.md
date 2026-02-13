# KyberVision23 Project Overview

This project is a platform supporting the Kyber Vision mobile application. It is a web application that allows users to view and manage their data collected from the mobile application.

The mobile application tool used for data collection. Users who watch live matches or review video matches can use the mobile application that allows them to record actions occuring during the match.

The API is built using ExpressJS, formerly called KyberVision22API. The web-manager is built using NextJS, formerly called KyberVision22Manager. The database is built using Node and Sequelize ORM to communicate with a sqlite database. The database/ directory is imported from the project formerly called KyberVision22Db. This KyberVision22Db was imported into the API and other services.

The project also used a KyberVision22Queuer which is an ExpressJS application that uses BullMQ to manage a queue of jobs. It would run other services as child processes. These child processes were KyberVision22VideoMontageMaker and KyberVision22YouTubeUploader.

## Crosswalk

| first level directory | KyberVision22        |
| --------------------- | -------------------- |
| api/                  | KyberVision22API     |
| web-manager/          | KyberVision22Manager |
| database/             | KyberVision22Db      |
| worker-node/          | KyberVision22Queuer  |

### worker-node implementation

KyberVision22VideoMontageMaker has been absorbed into the worker-node/ project. The KyberVision22YouTubeUploader has already been fully absorbed into the worker-node/ project.

## Migrating KyberVision22Queuer

The KyberVision22Queuer is now moved to the worker-node/ subproject directory. It is its own service and no longer runs child processes for montage creation or YouTube uploads. The worker-node/ is an API / BullMQ service that queues jobs and processes the functionalities that KyberVision22VideoMontageMaker and KyberVision22YouTubeUploader previously handled as child processes.

### KyberVision22VideoMontageMaker

Is found in /Users/nick/Documents/KyberVision22VideoMontageMaker. A microservice that generates video montages by extracting clips from a source video based on specified timestamps and merging them into a final video.

### KyberVision22YouTubeUploader

Is found in /Users/nick/Documents/KyberVision22YouTubeUploader. this service has already been fully absorbed into the worker-node/ project.
