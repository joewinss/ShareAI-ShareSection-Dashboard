import axios from "axios";
import {
  camelCase,
  concat,
  forEach,
  get,
  isNumber,
  isPlainObject,
  isString,
  snakeCase,
  isEmpty,
  has,
} from "lodash";
import localStorage from "local-storage";
import client from "../../../env";
import { sessionPass } from "@/utility/startUp";
import { decrypt, encrypt } from "@/utility/session";

export const routePrefix = {
  auth: "auth",
  session: "session",
  admin: "admin",
  content: "content",
  category: "category",
  upload: "upload",
  share: "share",
  progress: "progress",
  excel: "excel",
  contentPresets: "content-presets",
  contentReview: "content-review",
  globalContent: "global-content",
  n8nContent: "n8n-content",
  globalShare: "global-share",
  platforms: "platforms",
  contentGeneration: "contentGeneration",
  contentPreset: "contentPreset",
  imagePool: "imagePool",
  videoPool: "videoPool",
  email: "email",
  user: "user",
  visualCategory: "visualCategory",
  visualGeneration: "visualGeneration",
  dashboard: "dashboard",
  visualIndustry: "visualIndustry",
  userPlatform: "userPlatform",
  onboarding: "onboarding",
  industry: "industry",
  generationConfiguration: "generationConfiguration",
  merchantDraw: "merchantDraw",
  voucherDraw: "voucherDraw",
};

export const apiUrl = `${client.uri.apiLink}api`;

const PAGESIZE = 30;

export function getSessionType(method, url) {
  const newUrl = url.replace(`${client.uri.apiLink}`, "/");

  //--------------------------------------------------------------//
  let timestamp = new Date().getTime();
  let authId = new Date().getTime();
  let encryptionKey = sessionPass;
  const sessionDesc = localStorage.get("sessionInfo") || {};

  if (!isEmpty(sessionDesc)) {
    let decryptKey = decrypt(
      encryptionKey,
      sessionDesc?.sessionId || "",
      sessionDesc?.sessionUse || ""
    );

    let value = `${method}=${newUrl}-${authId}${timestamp}`;

    let initVar = `${authId}${timestamp}`;

    let authCode = encrypt(decryptKey, initVar, value);

    return {
      authCode,
      timestamp,
      authId,
    };
  }

  return {};
}

export const defaultPopulatedFieldName = (field) =>
  camelCase(`populated_${snakeCase(field)}`);

export async function _base_axios_get(url, query, accessKey = "", header = {}) {
  // const accessKey2 = localStorage.get("redux").user.accessKey;
  const accessKey2 = localStorage.get("redux")?.user?.accessKey || "";
  const session = getSessionType("GET", url);
  if (!url) {
    return new Promise((resolve, reject) => {
      reject({
        message: "Url Not Found!",
      });
    });
  }

  if (!isPlainObject(query)) {
    query = {};
  }

  return await axios
    .get(`${url}`, {
      params: {
        ...query,
      },
      headers: {
        Authorization: "Bearer " + accessKey2,
        "auth-code": session?.authCode,
        "auth-id": session?.authId,
        timestamp: session?.timestamp,
        "ngrok-skip-browser-warning": "true",
        ...header,
      },
    })
    .then((res) => {
      return get(res, "data");
    })
    .catch((err) => {
      return new Promise((resolve, reject) => {
        reject({
          error: err,
          message: get(err, "response.data.message") || "Something went wrong!",
          errorType: get(err, "response.data.errorType") || "apiError",
        });
      });
    });
}

export async function _base_axios_post(
  url,
  query,
  accessKey = "",
  header = {}
) {
  const accessKey2 = localStorage.get("redux")?.user?.accessKey || "";
  const session = getSessionType("POST", url);
  if (!url) {
    return new Promise((resolve, reject) => {
      reject({
        message: "Url Not Found!",
      });
    });
  }
  if (!isPlainObject(query)) {
    query = {};
  }

  return await axios
    .post(
      `${url}`,
      {
        ...query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessKey2,
          "auth-code": session?.authCode,
          "auth-id": session?.authId,
          timestamp: session?.timestamp,
          "ngrok-skip-browser-warning": "true",
          ...header,
        },
      }
    )
    .then((res) => {
      return res;
    })
    .catch((err) => {
      let parsedData = JSON.parse(err.response?.config?.data);
      if (has(parsedData, "password")) {
        delete parsedData.password;
      }
      if (has(parsedData, "secondPassword")) {
        delete parsedData.secondPassword;
      }
      err.response.config.data = JSON.stringify(parsedData);

      if (has(query, "password")) {
        delete query.password;
      }
      if (has(query, "secondPassword")) {
        delete query.secondPassword;
      }

      return new Promise((resolve, reject) => {
        reject({
          error: err,
          message: get(err, "response.data.message") || "Something went wrong!",
          errorType: get(err, "response.data.errorType") || "apiError",
          errorCode: get(err, "response.data.code") || "",
        });
      });
    });
}

export async function _axios_base_get_list(
  url,
  limit = PAGESIZE,
  skip = 0,
  query = {},
  accessKey = "",
  header = {}
) {
  let accessKey2 = localStorage.get("redux")?.user?.accessKey || "";
  const session = getSessionType("GET", url);
  if (!isString(url)) {
    return new Promise((resolve, reject) => {
      reject({
        type: "url_not_found",
        message: "Url not found",
      });
    });
  }

  let getAll = limit === "all";
  if (!isNumber(limit) && !getAll) {
    limit = PAGESIZE;
  }

  // if (getAll) {
  //   limit = 50;
  // }

  if (!isNumber(skip)) {
    skip = 0;
  }

  if (!isPlainObject(query)) {
    query = {};
  }

  if (!isEmpty(accessKey)) {
    accessKey2 = accessKey;
  }

  return await axios
    .get(url, {
      params: {
        ...query,
        limit: limit,
        skip: skip,
      },
      paramsSerializer: (params) => {
        // Custom serializer to preserve null values and handle arrays
        const parts = [];
        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (value === null) {
            parts.push(`${encodeURIComponent(key)}=null`);
          } else if (Array.isArray(value)) {
            // Handle arrays by creating multiple params with the same key
            value.forEach((item) => {
              parts.push(
                `${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`
              );
            });
          } else if (value !== undefined) {
            parts.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            );
          }
        });
        return parts.join("&");
      },
      headers: {
        Authorization: "Bearer " + accessKey2,
        "auth-code": session?.authCode,
        "auth-id": session?.authId,
        timestamp: session?.timestamp,
        "ngrok-skip-browser-warning": "true",
        ...header,
      },
    })
    .then(async (res) => {
      if (getAll) {
        let leftPage = Math.ceil(
          ((get(res, `data.total`) || 0) - limit) / limit
        );
        if (leftPage > 0) {
          let promises = [];
          for (let index = 1; index <= leftPage; index++) {
            promises.push(
              _axios_base_get_list(url, limit, index * limit, query, accessKey2)
            );
          }

          let responses = await Promise.all(promises);
          forEach(responses, (response) => {
            res.data.data = concat(
              res.data.data,
              get(response, `data.data`) || []
            );
          });
        }
      }
      return res.data;
    })
    .catch((err) => {
      return new Promise((resolve, reject) => {
        reject({
          errorType: get(err, "response.data.errorType") || "api_error",
          message: get(err, "response.data.message") || "API Error",
          err: err,
        });
      });
    });
}
