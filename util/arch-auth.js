import firebase from "firebase";

function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        let providerData = firebaseUser.providerData;
        for (let i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
}

const ArchAuth = {
    signIn: (googleUser) => {
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        let unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleUser, firebaseUser)) {
                // Build Firebase credential with the Google ID token.
                let credential = firebase.auth.GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
                // Sign in with credential from the Google user.
                firebase.auth().signInWithCredential(credential).then(() => {
                }).catch((error) => {
                });
            }
        });
    },

    signOut: () => {
        const auth2 = gapi.auth2.getAuthInstance();
        firebase.auth().signOut().then(() => {
            auth2.disconnect();
            window.location.reload();
        }).catch((error) => {
        });
    },

    onAuthStateChange: (callback) => {
        firebase.auth().onAuthStateChanged(callback);
    },

    initSignInButton: (buttonId) => {
        window.gapi.signin2.render(buttonId, {
            'scope': 'profile email',
            'onsuccess': ArchAuth.signIn
        });
    },

    getCurrentUser: () => {
        return {uid: 'arunautebel'};
        return firebase.auth().currentUser;
    },

    authorized: (loggedInUserId, action) => {
        const currentUser = ArchAuth.getCurrentUser();
        return action && currentUser.uid === loggedInUserId;
    }
};

export default ArchAuth;
