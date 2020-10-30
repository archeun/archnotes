import firebase from "firebase";

export function signIn(googleUser) {
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential)
                .then(function () {
                })
                .catch(function (error) {
                });
        } else {
            console.log('User already signed-in Firebase.');
        }
    });
}

export function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    firebase.auth().signOut().then(function () {
        auth2.disconnect();
        window.location.reload();
    }).catch(function (error) {
    });
}

export function onAuthStateChange(callback) {
    firebase.auth().onAuthStateChanged(callback);
}

export function initSignInButton(buttonId) {
    window.gapi.signin2.render(buttonId, {
        'scope': 'profile email',
        'onsuccess': signIn
    });
}

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