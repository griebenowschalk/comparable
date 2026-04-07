import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";

import { getCognitoClientId, getCognitoUserPoolId } from "@/env";

let pool: CognitoUserPool | null = null;

function getPool(): CognitoUserPool | null {
  const poolId = getCognitoUserPoolId();
  const clientId = getCognitoClientId();
  if (!poolId || !clientId) return null;
  if (!pool) {
    pool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId });
  }
  return pool;
}

export function signOutCognito(): void {
  const user = getPool()?.getCurrentUser();
  if (user) user.signOut();
}

/** Returns a valid ID token JWT if a stored session exists; otherwise `null`. */
export function hydrateSessionFromStorage(): Promise<string | null> {
  return new Promise((resolve) => {
    const userPool = getPool();
    if (!userPool) {
      resolve(null);
      return;
    }
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }
    cognitoUser.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session?.isValid()) {
          resolve(null);
          return;
        }
        resolve(session.getIdToken().getJwtToken());
      },
    );
  });
}

export function signInWithPassword(
  email: string,
  password: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const userPool = getPool();
    if (!userPool) {
      reject(
        new Error(
          "Cognito is not configured (set pool and client id in .env).",
        ),
      );
      return;
    }
    const authenticationDetails = new AuthenticationDetails({
      Username: email.trim(),
      Password: password,
    });
    const cognitoUser = new CognitoUser({
      Username: email.trim(),
      Pool: userPool,
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session.getIdToken().getJwtToken());
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        reject(
          new Error(
            "New password required — complete the challenge in the AWS Cognito console.",
          ),
        );
      },
    });
  });
}

export function signUpWithEmail(
  email: string,
  password: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const userPool = getPool();
    if (!userPool) {
      reject(
        new Error(
          "Cognito is not configured (set pool and client id in .env).",
        ),
      );
      return;
    }
    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email.trim() }),
    ];
    userPool.signUp(email.trim(), password, attributeList, [], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const userPool = getPool();
    if (!userPool) {
      reject(
        new Error(
          "Cognito is not configured (set pool and client id in .env).",
        ),
      );
      return;
    }
    const cognitoUser = new CognitoUser({
      Username: email.trim(),
      Pool: userPool,
    });
    cognitoUser.confirmRegistration(code.trim(), true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
