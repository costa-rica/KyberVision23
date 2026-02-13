// Offline mock data for review reducer (simplified version)
export const reviewReducerOffline = {
  videosArray: [
    {
      id: 2,
      sessionId: 1,
      contractTeamUserId: 1,
      filename: "kv17-videoId0002-sessionId1.mp4",
      url: "https://192.168.8.45:3000/videos/2",
      videoFileCreatedDateTimeEstimate: null,
      videoFileSizeInMb: 101.65,
      pathToVideoFile: "/Users/nickrodriguez/Documents/_project_resources/KyberVision17API/session_videos/uploaded",
      processingCompleted: true,
      processingFailed: true,
      youTubeVideoId: "9Ne01O7sMYo",
      originalVideoFilename: "20250720sessionTest.mp4",
      createdAt: "2025-07-20T22:28:53.889Z",
      updatedAt: "2025-07-20T22:29:22.086Z",
      ContractTeamUser: {
        id: 1,
        teamId: 1,
        userId: 1
      },
      session: {
        id: 1,
        sessionDate: "2025-07-20T21:50:00.000Z",
        city: "Practice",
        createdAt: "2025-07-20T21:56:45.219Z",
        updatedAt: "2025-07-20T21:56:45.219Z",
        teamId: 1,
        teamName: "Aix Bandits",
        teamCity: null,
        teamCoach: null
      }
    }
  ],
  actionsArray: [
    {
      id: 1,
      complexId: null,
      pointId: null,
      scriptId: 1,
      playerId: 1,
      type: "Set",
      subtype: null,
      quality: "0",
      timestamp: "2025-07-20T21:56:54.543Z",
      zone: "4",
      createdAt: "2025-07-20T21:57:19.644Z",
      updatedAt: "2025-07-20T21:57:19.644Z",
      timestampReferenceFirstAction: "2025-07-20T21:56:54.543Z"
    }
  ]
} as const;