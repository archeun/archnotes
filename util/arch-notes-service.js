import ArchNotesDataStore from "./arch-notes-data-store";
import ArchAuth from "./arch-auth";
import ArchNotesUnauthorizedException from "./arch-exception";


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

const authorize = (loggedInUserId, action, message) => {
    if (!ArchAuth.authorized(loggedInUserId, action)) {
        throw new ArchNotesUnauthorizedException(`You are not authorized to perform the action: '${message}'`);
    }
}

const ArchNotesService = {
    ITEM_TYPE_NOTE: 'note',
    ITEM_TYPE_DIRECTORY: 'directory',

    fetchNotesAndDirectories: async (loggedInUserId) => {
        authorize(loggedInUserId, 'fetchNotesAndDirectories', 'Fetch Notes and Directories');
        let notes = await ArchNotesService.fetchNotes(loggedInUserId);
        let directories = await ArchNotesService.fetchDirectories(loggedInUserId);
        notes = notes.map((note) => {
            return {...note, "type": ArchNotesService.ITEM_TYPE_NOTE}
        });
        directories = directories.map((directory) => {
            return {...directory, "type": ArchNotesService.ITEM_TYPE_DIRECTORY}
        });
        return createDirectoryTree(
            notes.concat(directories)
        );
    },

    fetchNotes: async (loggedInUserId) => {
        authorize(loggedInUserId, 'fetchNotes', 'Fetch Notes');
        return await ArchNotesDataStore.fetchNotesForUser(loggedInUserId);
    },

    fetchDirectories: async (loggedInUserId) => {
        authorize(loggedInUserId, 'fetchDirectories', 'Fetch Directories');
        return await ArchNotesDataStore.fetchDirectoriesForUser(loggedInUserId);
    },

    fetchDirectoryById: async (loggedInUserId, id) => {
        authorize(loggedInUserId, 'fetchDirectories', 'Fetch Directory by Id');
        return await ArchNotesDataStore.fetchDirectoryByIdForUser(loggedInUserId, id);
    },

    createDirectory: async (loggedInUserId, name, parentId) => {
        authorize(loggedInUserId, 'createDirectory', 'Create Directory');
        let newDirectory = {"name": name};
        if (parentId) {
            const parentDir = await ArchNotesService.fetchDirectoryById(loggedInUserId, parentId);
            if (parentDir && parentDir.exists) {
                newDirectory['parent_id'] = parentDir.ref;
            }
        }
        return await ArchNotesDataStore.createDirectoryForUser(loggedInUserId, newDirectory);
    },

    createNote: async (loggedInUserId, name, directoryId) => {
        authorize(loggedInUserId, 'createDirectory', 'Create Note');
        let newNote = {"title": name};
        if (directoryId) {
            const directory = await ArchNotesService.fetchDirectoryById(loggedInUserId, directoryId);
            if (directory && directory.exists) {
                newNote['directory_id'] = directory.ref;
            }
        }
        return await ArchNotesDataStore.createNoteForUser(loggedInUserId, newNote);
    },

    renameDirectory: async (loggedInUserId, directoryId, newName) => {
        authorize(loggedInUserId, 'renameDirectory', 'Rename Directory');
        return await ArchNotesDataStore.renameDirectoryForUser(loggedInUserId, directoryId, newName);
    },

    fetchNotesOfDirectory: async (loggedInUserId, directoryId) => {
        authorize(loggedInUserId, 'fetchNotesOfDirectory', 'Fetch notes of directory');
        return await ArchNotesDataStore.fetchNotesOfDirectory(loggedInUserId, directoryId);
    },

    detachNotesOfDirectory: async (loggedInUserId, directoryId) => {
        authorize(loggedInUserId, 'renameDirectory', 'Detach notes of Directory');
        const notes = await ArchNotesDataStore.fetchNotesOfDirectory(loggedInUserId, directoryId);
        notes.forEach((note) => {
            ArchNotesDataStore.updateNoteOfUser(loggedInUserId, note.id, {directory_id: null});
        });
    },

    fetchSubDirsOfDirectory: async (loggedInUserId, directoryId) => {
        authorize(loggedInUserId, 'fetchSubDirsOfDirectory', 'Fetch sub directories of directory');
        return await ArchNotesDataStore.fetchSubDirsOfDirectory(loggedInUserId, directoryId);
    },

    detachSubDirsOfDirectory: async (loggedInUserId, directoryId) => {
        authorize(loggedInUserId, 'detachSubDirsOfDirectory', 'Detach sub directories of Directory');
        const subDirs = await ArchNotesService.fetchSubDirsOfDirectory(loggedInUserId, directoryId);
        subDirs.forEach((dir) => {
            ArchNotesDataStore.updateDirectoryOfUser(loggedInUserId, dir.id, {parent_id: null});
        });
    },

    deleteDirectory: async (loggedInUserId, directoryId) => {
        authorize(loggedInUserId, 'deleteDirectory', 'Delete Directory');
        await ArchNotesService.detachNotesOfDirectory(loggedInUserId, directoryId);
        await ArchNotesService.detachSubDirsOfDirectory(loggedInUserId, directoryId);
        return await ArchNotesDataStore.deleteDirectoryForUser(loggedInUserId, directoryId);
    },

    renameNote: async (loggedInUserId, noteId, newName) => {
        authorize(loggedInUserId, 'renameNote', 'Rename Note');
        return await ArchNotesDataStore.renameNoteForUser(loggedInUserId, noteId, newName);
    },

    deleteNote: async (loggedInUserId, noteId) => {
        authorize(loggedInUserId, 'deleteNote', 'Delete Note');
        return await ArchNotesDataStore.deleteNoteForUser(loggedInUserId, noteId);
    },

    moveDirectoryOfUserToParent: async (loggedInUserId, childDirId, parentDirId) => {
        authorize(loggedInUserId, 'moveDirectoryOfUserToParent', 'Move directory under a parent directory');
        let parentDirRef = null;
        if (parentDirId) {
            const parentDir = await ArchNotesService.fetchDirectoryById(loggedInUserId, parentDirId);
            if (parentDir && parentDir.exists) {
                parentDirRef = parentDir.ref;
            }
        }
        return await ArchNotesDataStore.updateDirectoryOfUser(loggedInUserId, childDirId, {'parent_id': parentDirRef});
    },

    moveNoteOfUserToDirectory: async (loggedInUserId, noteId, dirId) => {
        authorize(loggedInUserId, 'moveDirectoryOfUserToParent', 'Move note under a parent directory');
        let dirReference = null;
        if (dirId) {
            const directory = await ArchNotesService.fetchDirectoryById(loggedInUserId, dirId);
            if (directory && directory.exists) {
                dirReference = directory.ref;
            }
        }
        return await ArchNotesDataStore.updateNoteOfUser(loggedInUserId, noteId, {'directory_id': dirReference});
    }
}

export default ArchNotesService;