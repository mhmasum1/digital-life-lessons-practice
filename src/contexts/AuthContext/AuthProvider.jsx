import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const registerUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const logOut = () => {
        setLoading(true);
        localStorage.removeItem("fb-token");
        return signOut(auth);
    };

    //update profile + reload + setUser 
    const updateUserProfile = async (profile) => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No authenticated user found");

        await updateProfile(currentUser, profile);

        // force refresh from Firebase
        await currentUser.reload();

        // update react state so UI reflects immediately
        setUser({ ...auth.currentUser });

        return true;
    };

    // Re-authenticate for sensitive actions 
    const reauthenticateUser = (currentPassword) => {
        const currentUser = auth.currentUser;

        if (!currentUser?.email) {
            return Promise.reject(new Error("No authenticated user found"));
        }

        const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );

        return reauthenticateWithCredential(currentUser, credential);
    };

    // Change password
    const changeUserPassword = (newPassword) => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            return Promise.reject(new Error("No authenticated user found"));
        }

        return updatePassword(currentUser, newPassword);
    };

    // observe user state
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // fresh token 
                const token = await currentUser.getIdToken(true);
                localStorage.setItem("fb-token", token);
            } else {
                localStorage.removeItem("fb-token");
            }
        });

        return () => unSubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        registerUser,
        signInUser,
        signInGoogle,
        logOut,
        updateUserProfile,
        reauthenticateUser,
        changeUserPassword,
    };

    return (
        <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
    );
};

export default AuthProvider;