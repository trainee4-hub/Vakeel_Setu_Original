import { API_BASE_URL } from "@shared/services/apiClient";
import { getAuthToken } from "@/utils/auth";

/* =========================================================================
   HEADERS
============================================================================ */

const getJsonHeaders = () => {
  const token =
    getAuthToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
};

const getUploadHeaders = () => {
  const token =
    getAuthToken();

  return {
    Accept: "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
};

/* =========================================================================
   RESPONSE
============================================================================ */

const parseResponse = async (
  response,
  {
    method = "REQUEST",
    endpoint = "",
    requestBody = null,
  } = {},
) => {
  let payload = null;

  try {
    payload =
      await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    console.error(
      "[advocateProfileApi] Request failed:",
      {
        method,
        endpoint:
          `${API_BASE_URL}${endpoint}`,
        status:
          response.status,
        statusText:
          response.statusText,
        requestBody,
        response:
          payload,
      },
    );

    const error =
      new Error(
        payload?.message ||
          payload?.error ||
          payload?.errors?.[0]
            ?.message ||
          `Request failed with status ${response.status}`,
      );

    error.status =
      response.status;

    error.data =
      payload;

    error.requestBody =
      requestBody;

    throw error;
  }

  return payload;
};

/* =========================================================================
   GET
============================================================================ */

const get = async (
  endpoint,
) => {
  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "GET",

        credentials:
          "include",

        headers:
          getUploadHeaders(),
      },
    );

  return parseResponse(
    response,
    {
      method: "GET",
      endpoint,
    },
  );
};

/* =========================================================================
   PATCH
============================================================================ */

const patch = async (
  endpoint,
  body,
) => {
  console.log(
    "[advocateProfileApi] PATCH request:",
    {
      endpoint:
        `${API_BASE_URL}${endpoint}`,
      body,
    },
  );

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "PATCH",

        credentials:
          "include",

        headers:
          getJsonHeaders(),

        body:
          JSON.stringify(
            body,
          ),
      },
    );

  return parseResponse(
    response,
    {
      method: "PATCH",
      endpoint,
      requestBody:
        body,
    },
  );
};

/* =========================================================================
   UPLOAD
============================================================================ */

const upload = async (
  endpoint,
  formData,
) => {
  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",

        credentials:
          "include",

        /*
         * FormData ke saath Content-Type manually
         * mat lagana. Browser boundary set karega.
         */
        headers:
          getUploadHeaders(),

        body:
          formData,
      },
    );

  return parseResponse(
    response,
    {
      method: "POST",
      endpoint,
    },
  );
};

/* =========================================================================
   API
============================================================================ */

export const advocateProfileApi = {
  async getProfile() {
    return get(
      "/advocate/profile",
    );
  },

  async updateProfile(
    payload,
  ) {
    return patch(
      "/advocate/profile",
      payload,
    );
  },

  async uploadPhoto(file) {
    const formData =
      new FormData();

    formData.append(
      "profilePhoto",
      file,
    );

    return upload(
      "/advocate/profile/photo",
      formData,
    );
  },
};

export default advocateProfileApi;