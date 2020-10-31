import firebase from "firebase";

const getDb = () => {
    return firebase.firestore();
}

const ArchNotesDataStore = {
    fetchDirectoriesForUser: async (userUid) => {
        let directoryStructure = [];
        const directories = await getDb().collection(`notes/${userUid}/directories`).get().then();
        directories.forEach((doc) => {
            let dir = doc.data();
            directoryStructure.push({'title': dir.name, 'key': doc.id, 'parent_id': dir.parent_id ? dir.parent_id.id : null});
        });
        return directoryStructure;
    },

    fetchDirectoryByIdForUser: async (userUid, directoryId) => {
        return await getDb().collection(`notes/${userUid}/directories`).doc(directoryId).get().then();
    },

    fetchNotesForUser: async (userUid) => {
        let noteList = [];
        const notes = await getDb().collection(`notes/${userUid}/notes`).get().then();
        notes.forEach((doc) => {
            let note = doc.data();
            noteList.push({'title': note.title, 'key': doc.id, 'parent_id': note.directory_id ? note.directory_id.id : null});
        });
        return noteList;
    },

    createDirectoryForUser: async (userUid, directory) => {
        return await getDb().collection(`notes/${userUid}/directories`).add(directory).then();
    },

    createNoteForUser: async (userUid, note) => {
        return await getDb().collection(`notes/${userUid}/notes`).add(note).then();
    },

    renameDirectoryForUser: async (userUid, directoryId, newName) => {
        return await getDb().collection(`notes/${userUid}/directories`).doc(directoryId).update({name: newName}).then();
    },

    fetchSubDirsOfDirectory: async (userUid, directoryId) => {
        const parentDir = await getDb().doc(`notes/${userUid}/directories/${directoryId}`);
        return await getDb().collection(`notes/${userUid}/directories`).where('parent_id', '==', parentDir).get();
    },

    fetchNotesOfDirectory: async (userUid, directoryId) => {
        const parentDir = await getDb().doc(`notes/${userUid}/directories/${directoryId}`);
        return await getDb().collection(`notes/${userUid}/notes`).where('directory_id', '==', parentDir).get();
    },

    deleteDirectoryForUser: async (userUid, directoryId) => {
        return await getDb().collection(`notes/${userUid}/directories`).doc(directoryId).delete().then();
    },

    renameNoteForUser: async (userUid, noteId, newName) => {
        return await getDb().collection(`notes/${userUid}/notes`).doc(noteId).update({title: newName}).then();
    },

    deleteNoteForUser: async (userUid, noteId) => {
        return await getDb().collection(`notes/${userUid}/notes`).doc(noteId).delete().then();
    },

    updateNoteOfUser: async (userUid, noteId, noteData) => {
        return await getDb().collection(`notes/${userUid}/notes`).doc(noteId).update(noteData).then();
    },

    updateDirectoryOfUser: async (userUid, directoryId, directoryData) => {
        return await getDb().collection(`notes/${userUid}/directories`).doc(directoryId).update(directoryData).then();
    },


}

export default ArchNotesDataStore;