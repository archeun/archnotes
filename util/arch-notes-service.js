import ArchNotesDataStore from "./arch-notes-data-store";

const createDirectoryTree = directories => {
    let hashTable = Object.create(null)
    directories.forEach(aData => hashTable[aData.key] = {...aData, children: []})
    let dataTree = []
    directories.forEach(aData => {
        if (aData.parent_id) hashTable[aData.parent_id].children.push(hashTable[aData.key])
        else dataTree.push(hashTable[aData.key])
    })
    return dataTree
}

const ArchNotesService = {
    fetchNotesAndDirectories: async (loggedInUserId) => {
        let notes = await ArchNotesDataStore.fetchNotesForUser(loggedInUserId);
        let directories = await ArchNotesDataStore.fetchDirectoriesForUser(loggedInUserId);
        return createDirectoryTree(
            notes.concat(directories)
        );
    }
}

export default ArchNotesService;