import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  arrayUnion,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

/** Shape of a user document stored in Firestore `users/{uid}` */
export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  /** Set by the onboarding flow — child's preferred name / username */
  username: string
  /** Age selected during onboarding */
  age: string
  /** Up to 5 interest tags chosen during onboarding */
  interests: string[]
  /** Favourite show chosen during onboarding */
  favoriteShow: string
  /** Favourite book chosen during onboarding */
  favoriteBook: string
  /** True once the 3-step onboarding wizard is completed */
  onboarded: boolean
  /** Reviewer access flag enabled via onboarding coupon check */
  freeTrial: boolean
  createdAt: ReturnType<typeof serverTimestamp> | null
  updatedAt: ReturnType<typeof serverTimestamp> | null
}

/**
 * Fetch the Firestore profile for a given uid.
 * Returns `null` when the document does not exist yet (not yet onboarded).
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  const raw = snap.data() as Partial<UserProfile>

  return {
    ...(raw as UserProfile),
    uid,
    freeTrial: Boolean(raw.freeTrial),
  }
}

/**
 * Create or fully overwrite the Firestore user profile.
 * Called at the end of the onboarding wizard.
 */
export async function saveUserProfile(
  uid: string,
  profile: Omit<UserProfile, "uid" | "createdAt" | "updatedAt" | "onboarded">
): Promise<void> {
  const ref = doc(db, "users", uid)
  // Use merge so that a partial re-save doesn't wipe fields
  await setDoc(
    ref,
    {
      ...profile,
      uid,
      onboarded: true,
      freeTrial: Boolean(profile.freeTrial),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(), // only written if the field is absent (merge)
    },
    { merge: true }
  )
}

// ─── Projects ────────────────────────────────────────────────────────────────

/** A character described inside a story project. */
export interface Character {
  name: string
  description: string
}

/** A single page in the 12-page story. */
export interface PageEntry {
  pageNumber: number // 1–12
  content: string
  status: "empty" | "draft" | "done" | "reviewed"
  wordCount: number
  updatedAt: Timestamp | null
  /** URL of the AI-generated illustration for this page (set after book completion) */
  imageUrl?: string
}

/** Gibbs-style coaching feedback for a finished page. */
export interface PageFeedback {
  pageNumber: number
  whatYouWrote: string
  whatWentGreat: string
  tryNextTime: string
  skills: string[]
  createdAt: Timestamp | null
}

/** A single message in the in-page AI chat. */
export interface AiMessage {
  role: "user" | "assistant"
  content: string
  /** Optional machine-usable text that can be inserted into the editor. */
  insertableText?: string
  pageContext: number | null
  createdAt: Timestamp | null
}

/** A recorded voice session with Alicia. */
export interface VoiceSession {
  pageNumber: number
  transcript: string
  durationSeconds: number
  createdAt: Timestamp | null
}

/**
 * Shape of a project document stored in Firestore `projects/{projectId}`.
 */
export interface StoryProject {
  id: string
  /** ID of the Firebase Auth user who owns this project */
  userId: string
  /** Display name of the owner at creation time */
  userName: string | null
  /** Photo URL of the owner at creation time */
  userPhotoURL: string | null
  /** Human-readable story title */
  title: string
  /** Main characters and their descriptions */
  characters: Character[]
  /**
   * One-sentence story objective answering:
   * "Who wants what, and why?"
   */
  objective: string
  /** Description of the story's setting — place, atmosphere, etc. */
  setting: string
  /**
   * URL of the AI-generated or placeholder cover image.
   * `null` until generated.
   */
  bannerUrl: string | null
  /** 12 story pages seeded on creation. */
  pages: PageEntry[]
  /** Coaching feedback per page, appended after each page review. */
  pageFeedback: PageFeedback[]
  /** In-page AI text chat history. */
  chatHistory: AiMessage[]
  /** Past voice sessions. */
  voiceSessions: VoiceSession[]
  /** The page the child is currently working on (1–12). */
  currentPage: number
  /**
   * Lifecycle status of the project.
   * - "draft"     → in progress (default)
   * - "illustrated" → all pages generated, awaiting publish
   * - "published"  → visible in the marketplace
   */
  status?: "draft" | "illustrated" | "published"
  /** Set when the project is published to the marketplace. */
  publishedAt?: ReturnType<typeof serverTimestamp> | null
  createdAt: ReturnType<typeof serverTimestamp> | null
  updatedAt: ReturnType<typeof serverTimestamp> | null
}

// Constant placeholder until real AI image generation is wired up
const PLACEHOLDER_BANNER =
  "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/luxury-book-cover-for-kids-design-template-0183c75605e27e745ea2415db5d59b72_screen.jpg?ts=1692367693"

/** Build the initial 12-page array with everything empty. */
function seedPages(): Omit<PageEntry, "updatedAt">[] {
  return Array.from({ length: 12 }, (_, i) => ({
    pageNumber: i + 1,
    content: "",
    status: "empty" as const,
    wordCount: 0,
  }))
}

/**
 * Create a new project document in the `projects` collection.
 * Returns the Firestore-generated document ID.
 */
export async function createProject(
  data: Pick<
    StoryProject,
    | "userId"
    | "userName"
    | "userPhotoURL"
    | "title"
    | "characters"
    | "objective"
    | "setting"
  >
): Promise<string> {
  const ref = await addDoc(collection(db, "projects"), {
    ...data,
    bannerUrl: PLACEHOLDER_BANNER,
    pages: seedPages().map((p) => ({ ...p, updatedAt: null })),
    pageFeedback: [],
    chatHistory: [],
    voiceSessions: [],
    currentPage: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Fetch a single project by document ID.
 */
export async function getProject(
  projectId: string
): Promise<StoryProject | null> {
  const ref = doc(db, "projects", projectId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  const raw = snap.data()

  // Backfill fields that may be missing on docs created before the schema update
  const defaultPages: PageEntry[] = Array.from({ length: 12 }, (_, i) => ({
    pageNumber: i + 1,
    content: "",
    status: "empty" as const,
    wordCount: 0,
    updatedAt: null,
  }))

  return {
    id: snap.id,
    ...raw,
    pages: raw.pages ?? defaultPages,
    currentPage: raw.currentPage ?? 1,
    pageFeedback: raw.pageFeedback ?? [],
    chatHistory: raw.chatHistory ?? [],
    voiceSessions: raw.voiceSessions ?? [],
  } as StoryProject
}

/**
 * Fetch all projects that belong to a given user, ordered newest first.
 */
export async function getUserProjects(uid: string): Promise<StoryProject[]> {
  const q = query(
    collection(db, "projects"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  const defaultPages: PageEntry[] = Array.from({ length: 12 }, (_, i) => ({
    pageNumber: i + 1,
    content: "",
    status: "empty" as const,
    wordCount: 0,
    updatedAt: null,
  }))
  return snap.docs.map((d) => {
    const raw = d.data()
    return {
      id: d.id,
      ...raw,
      pages: raw.pages ?? defaultPages,
      currentPage: raw.currentPage ?? 1,
      pageFeedback: raw.pageFeedback ?? [],
      chatHistory: raw.chatHistory ?? [],
      voiceSessions: raw.voiceSessions ?? [],
    } as StoryProject
  })
}

/**
 * Overwrite a single page's content + status in the `pages` array.
 * Uses arrayUnion is not suitable here — we write the whole pages array.
 * Instead we fetch → patch → write for simplicity (12 pages = small doc).
 */
export async function updatePage(
  projectId: string,
  pageNumber: number,
  patch: Partial<Pick<PageEntry, "content" | "status" | "wordCount">>
): Promise<void> {
  if (!pageNumber || !Number.isFinite(pageNumber)) return
  const ref = doc(db, "projects", projectId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const project = snap.data() as StoryProject
  const existing: PageEntry[] =
    project.pages ??
    Array.from({ length: 12 }, (_, i) => ({
      pageNumber: i + 1,
      content: "",
      status: "empty" as const,
      wordCount: 0,
      updatedAt: null,
    }))

  const hasPage = existing.some((p) => p.pageNumber === pageNumber)
  const pages: PageEntry[] = hasPage
    ? existing.map((p) =>
        p.pageNumber === pageNumber
          ? { ...p, ...patch, updatedAt: Timestamp.now() }
          : p
      )
    : [
        ...existing,
        {
          pageNumber,
          content: patch.content ?? "",
          status: patch.status ?? "draft",
          wordCount: patch.wordCount ?? 0,
          updatedAt: Timestamp.now(),
        },
      ]

  // Firestore rejects `undefined` field values — sanitise each page entry.
  const cleanPages = pages.map(
    (p) =>
      Object.fromEntries(
        Object.entries(p).filter(([, v]) => v !== undefined)
      ) as PageEntry
  )

  await updateDoc(ref, {
    pages: cleanPages,
    currentPage: pageNumber,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Append Gibbs-style feedback for a page.
 */
export async function savePageFeedback(
  projectId: string,
  feedback: Omit<PageFeedback, "createdAt">
): Promise<void> {
  const ref = doc(db, "projects", projectId)
  await updateDoc(ref, {
    pageFeedback: arrayUnion({ ...feedback, createdAt: Timestamp.now() }),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Append a message to the project's AI chat history.
 */
export async function addChatMessage(
  projectId: string,
  message: Omit<AiMessage, "createdAt">
): Promise<void> {
  const ref = doc(db, "projects", projectId)
  const cleanMessage = Object.fromEntries(
    Object.entries({ ...message, createdAt: Timestamp.now() }).filter(
      ([, value]) => value !== undefined
    )
  )
  await updateDoc(ref, {
    chatHistory: arrayUnion(cleanMessage),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Record a completed voice session.
 */
export async function addVoiceSession(
  projectId: string,
  session: Omit<VoiceSession, "createdAt">
): Promise<void> {
  const ref = doc(db, "projects", projectId)
  await updateDoc(ref, {
    voiceSessions: arrayUnion({ ...session, createdAt: Timestamp.now() }),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Persist the Gemini-generated illustration URL into the page entry.
 * Reads the current pages array, patches the matching page, then writes it back.
 */
export async function savePageIllustration(
  projectId: string,
  pageNumber: number,
  imageUrl: string
): Promise<void> {
  const ref = doc(db, "projects", projectId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const data = snap.data() as StoryProject
  const pages: PageEntry[] = (data.pages ?? []).map((p) =>
    p.pageNumber === pageNumber ? { ...p, imageUrl } : p
  )
  await updateDoc(ref, { pages, updatedAt: serverTimestamp() })
}

/**
 * Mark a project as published to the marketplace.
 * Sets status → "published" and records a publishedAt timestamp.
 */
export async function publishProject(projectId: string): Promise<void> {
  const ref = doc(db, "projects", projectId)
  await updateDoc(ref, {
    status: "published",
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Mark a project as fully illustrated (all page images generated).
 */
export async function markProjectIllustrated(projectId: string): Promise<void> {
  const ref = doc(db, "projects", projectId)
  await updateDoc(ref, {
    status: "illustrated",
    updatedAt: serverTimestamp(),
  })
}

/**
 * Fetch all projects that have been published to the marketplace.
 */
export async function getMarketplaceProjects(): Promise<StoryProject[]> {
  const q = query(
    collection(db, "projects"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...(d.data() as StoryProject), id: d.id }))
}
