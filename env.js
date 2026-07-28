export const ENV_VAL = {
  LOCAL: "localhost",
  STAGING: "staging",
  LIVE: "live",
}

let client = {
  // uri: {
  //   apiLink: "http://localhost:5000/",
  //   env: ENV_VAL.LOCAL,
  //   consiChatPhoneNumber: "15558351762", // Power Ranger
  // },

  uri: {
    // staging
    apiLink: "https://stg-share-ai-api.itscreative.biz/",
    env: ENV_VAL.STAGING,
    consiChatPhoneNumber: "15558351762", // Power Ranger
  },

  // uri: {
  //   apiLink: "https://shareai-api.itscreative.biz/",
  //   env: ENV_VAL.LIVE,
  //   googleTag: "G-TXSD9N3XND",
  //   mixpanelToken: "e58091025958857c5d504cadae60d12e",
  //   consiChatPhoneNumber: "60389664319", // consichat
  // },
};

export default client;
