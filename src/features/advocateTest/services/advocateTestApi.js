import { apiRequest } from "@shared/services/apiClient";

/**
 * Public Advocate Qualification Test API Service
 * Base URL: /api/advocate-test
 */

/**
 * POST /api/advocate-test/login
 * Body: { token, barCouncilId, phone }
 */
export async function loginAdvocateTest({ token, barCouncilId, phone }) {
  return apiRequest("/advocate-test/login", {
    method: "POST",
    token: null, // No app login token
    body: {
      token: String(token || "").trim(),
      barCouncilId: String(barCouncilId || "").trim(),
      phone: String(phone || "").trim(),
    },
  });
}

/**
 * POST /api/advocate-test/start
 * Headers: Authorization: Bearer <testSession>
 */
export async function startAdvocateTest(testSession) {
  if (!testSession) {
    throw new Error("testSession is required");
  }
  return apiRequest("/advocate-test/start", {
    method: "POST",
    token: testSession,
  });
}

/**
 * PUT /api/advocate-test/answers
 * Headers: Authorization: Bearer <testSession>
 * Body: { answers: [{ index: 0, selected: "B" }] }
 */
export async function saveAdvocateTestAnswers(testSession, answers) {
  if (!testSession) {
    throw new Error("testSession is required");
  }
  return apiRequest("/advocate-test/answers", {
    method: "PUT",
    token: testSession,
    body: {
      answers: Array.isArray(answers) ? answers : [],
    },
  });
}

/**
 * POST /api/advocate-test/submit
 * Headers: Authorization: Bearer <testSession>
 * Body: { answers: [...] }
 */
export async function submitAdvocateTest(testSession, answers) {
  if (!testSession) {
    throw new Error("testSession is required");
  }
  return apiRequest("/advocate-test/submit", {
    method: "POST",
    token: testSession,
    body: {
      answers: Array.isArray(answers) ? answers : [],
    },
  });
}

/**
 * POST /api/advocate-test/request-reschedule
 * Case A (from result screen): Bearer <testSession>
 * Case B (from expired screen): Body { token, barCouncilId, phone }
 */
export async function rescheduleAdvocateTest({
  testSession = null,
  token = null,
  barCouncilId = null,
  phone = null,
} = {}) {
  const options = {
    method: "POST",
  };

  if (testSession) {
    options.token = testSession;
  } else {
    options.token = null;
    options.body = {
      token: String(token || "").trim(),
      barCouncilId: String(barCouncilId || "").trim(),
      phone: String(phone || "").trim(),
    };
  }

  return apiRequest("/advocate-test/request-reschedule", options);
}

