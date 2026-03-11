import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Shape of a user document stored in Firestore `users/{uid}` */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** Set by the onboarding flow — child's preferred name / username */
  username: string;
  /** Age selected during onboarding */
  age: string;
  /** Up to 5 interest tags chosen during onboarding */
  interests: string[];
  /** Favourite show chosen during onboarding */
  favoriteShow: string;
  /** Favourite book chosen during onboarding */
  favoriteBook: string;
  /** True once the 3-step onboarding wizard is completed */
  onboarded: boolean;
  createdAt: ReturnType<typeof serverTimestamp> | null;
  updatedAt: ReturnType<typeof serverTimestamp> | null;
}

/**
 * Fetch the Firestore profile for a given uid.
 * Returns `null` when the document does not exist yet (not yet onboarded).
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * Create or fully overwrite the Firestore user profile.
 * Called at the end of the onboarding wizard.
 */
export async function saveUserProfile(
  uid: string,
  profile: Omit<UserProfile, "uid" | "createdAt" | "updatedAt" | "onboarded">
): Promise<void> {
  const ref = doc(db, "users", uid);
  // Use merge so that a partial re-save doesn't wipe fields
  await setDoc(
    ref,
    {
      ...profile,
      uid,
      onboarded: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(), // only written if the field is absent (merge)
    },
    { merge: true }
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────

/** A character described inside a story project. */
export interface Character {
  name: string;
  description: string;
}

/**
 * Shape of a project document stored in Firestore `projects/{projectId}`.
 */
export interface StoryProject {
  id: string;
  /** ID of the Firebase Auth user who owns this project */
  userId: string;
  /** Display name of the owner at creation time */
  userName: string | null;
  /** Photo URL of the owner at creation time */
  userPhotoURL: string | null;
  /** Human-readable story title */
  title: string;
  /** Main characters and their descriptions */
  characters: Character[];
  /**
   * One-sentence story objective answering:
   * "Who wants what, and why?"
   */
  objective: string;
  /** Description of the story's setting — place, atmosphere, etc. */
  setting: string;
  /**
   * URL of the AI-generated or placeholder cover image.
   * `null` until generated.
   */
  bannerUrl: string | null;
  createdAt: ReturnType<typeof serverTimestamp> | null;
  updatedAt: ReturnType<typeof serverTimestamp> | null;
}

// Constant placeholder until real AI image generation is wired up
const PLACEHOLDER_BANNER =
  "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/luxury-book-cover-for-kids-design-template-0183c75605e27e745ea2415db5d59b72_screen.jpg?ts=1692367693";

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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch all projects that belong to a given user, ordered newest first.
 */
export async function getUserProjects(
  uid: string
): Promise<StoryProject[]> {
  const q = query(
    collection(db, "projects"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoryProject));
}

