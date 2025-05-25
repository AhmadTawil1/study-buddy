import { db } from '@/src/firebase/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function createRequest(data) {
  const ref = await addDoc(collection(db, 'requests'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}
