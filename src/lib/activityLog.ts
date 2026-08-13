import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Trace minimale des actions sensibles (suppression/modification de données financières) —
// jusqu'ici seules les connexions étaient journalisées (voir login_events dans App.tsx).
export type ActivityAction = 'delete' | 'update';

export async function logActivity(params: {
  action: ActivityAction;
  entity: string;
  entityId: string;
  summary: string;
  before?: unknown;
}) {
  try {
    await addDoc(collection(db, 'activity_log'), {
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      summary: params.summary,
      before: params.before ?? null,
      userEmail: auth.currentUser?.email || 'inconnu',
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error logging activity', err);
  }
}
