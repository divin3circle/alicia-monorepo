import "server-only"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is missing`)
  }
  return value
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!
  }

  const projectId = requireEnv("FIREBASE_PROJECT_ID")
  const clientEmail = requireEnv("FIREBASE_CLIENT_EMAIL")
  const privateKey = requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
  const storageBucket = requireEnv("FIREBASE_STORAGE_BUCKET")

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  })
}

export function getAdminStorage() {
  const app = getAdminApp()
  return getStorage(app)
}
