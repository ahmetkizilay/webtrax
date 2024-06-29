export interface CreateDocumentParams {
  collection: string,
  data: any,
}

export async function createDocument(firestore: FirebaseFirestore.Firestore, params: CreateDocumentParams): Promise<string> {
  const { collection, data } = params;
  const docRef = firestore.collection(collection).doc();
  await docRef.set(data);
  console.log(`Created item in ${collection}: ${docRef.id}`);
  return docRef.id;
}
