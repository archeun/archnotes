import firebase from "firebase";


const ArchNotesDataStore = {
    fetchDirectoriesForUser: async (userUid) => {
        let directoryStructure = [];
        const db = firebase.firestore();
        const directories = await db.collection(`notes/${userUid}/directories`).get().then();
        directories.forEach((doc) => {
            let dir = doc.data();
            directoryStructure.push({'title': dir.name, 'key': doc.id, 'parent_id': dir.parent_id ? dir.parent_id.id : null});
        });
        return directoryStructure;
    },

    fetchNotesForUser: async (userUid) => {
        let directoryStructure = [];
        const db = firebase.firestore();
        const notes = await db.collection(`notes/${userUid}/notes`).get().then();
        notes.forEach((doc) => {
            let note = doc.data();
            directoryStructure.push({'title': note.title, 'key': doc.id, 'parent_id': note.directory_id ? note.directory_id.id : null});
        });
        return directoryStructure;
    }
}

export default ArchNotesDataStore;