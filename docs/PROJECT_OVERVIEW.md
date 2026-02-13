# KyberVision23 Project Overview

This project is a platform supporting the Kyber Vision mobile application. It is a web application that allows users to view and manage their data collected from the mobile application.

The mobile application tool used for data collection. Users who watch live matches or review video matches can use the mobile application that allows them to record actions occuring during the match.

The API is built using ExpressJS, formerly called KyberVision22API. The web-manager is built using NextJS, formerly called KyberVision22Manager. The database is built using Node and Sequelize ORM to communicate with a sqlite database. The db-models/ directory is imported from the project formerly called KyberVision22Db. This KyberVision22Db was imported into the API and other services.

The project also used a KyberVision22Queuer which is an ExpressJS application that uses BullMQ to manage a queue of jobs. It would run other services as child processes. These child processes were KyberVision22VideoMontageMaker and KyberVision22YouTubeUploader. These projects are all now integrated in the worker-node/ project.

## Crosswalk

| first level directory | KyberVision22                             |
| --------------------- | ----------------------------------------- |
| api/                  | KyberVision22API                          |
| web-manager/          | KyberVision22Manager                      |
| database/             | KyberVision22Db                           |
| worker-node/          | KyberVision22Queuer                       |
| worker-node/          | KyberVision22VideoMontageMaker (absorbed) |
| worker-node/          | KyberVision22YouTubeUploader (absorbed)   |

## Migrating KyberVision22Queuer

What was KyberVision22Queuer is now moved to the worker-node/ subproject directory. The worker-node's main function is the transition from the KyberVision22Queuer. The KyberVision22VideoMontageMaker and the KyberVision22YouTubeUploader have been absorbed into the worker-node/ project so these process no longer run as child processes but are fully integrated into the worker-node/ project.

- The KyberVision22Queuer is found https://github.com/costa-rica/KyberVision22Queuer
  - locally on the mac workstation in /Users/nick/Documents/KyberVision22Queuer
- The KyberVision22VideoMontageMaker is found https://github.com/costa-rica/KyberVision22VideoMontageMaker
  - locally on the mac workstation in /Users/nick/Documents/KyberVision22VideoMontageMaker
- The KyberVision22YouTubeUploader is found https://github.com/costa-rica/KyberVision22YouTubeUploader
  - locally on the mac workstation in /Users/nick/Documents/KyberVision22YouTubeUploader
