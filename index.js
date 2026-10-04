/* =========================================================
   FIREBASE IMPORTS
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBXWGA5kBY0qhmkL-wKZJ16VCjKsZM-4Gg",
    authDomain: "commerce-with-damith-manage.firebaseapp.com",
    projectId: "commerce-with-damith-manage",
    storageBucket: "commerce-with-damith-manage.firebasestorage.app",
    messagingSenderId: "646197742634",
    appId: "1:646197742634:web:0d4d69112babfba61d0753",
    measurementId: "G-DLSWTPW732"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/*
   IMPORTANT:
   Analytics is NOT required for this application.

   DO NOT use:

   const analytics = getAnalytics(app

   That was causing the previous JavaScript error.
*/


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

const MY_ADMIN_GMAIL =
    "vimukthithuhina754@gmail.com";

let singleVideos = [];

let playlistsData = [];

let currentView = "videos";

let selectedPlaylistId = null;

let isAdminLoggedIn = false;

let generatedOTP = null;

let pendingEmail = "";


/* =========================================================
   GOOGLE LOGIN
========================================================= */

window.triggerGoogleLogin = async function () {

    try {

        const provider =
            new GoogleAuthProvider();

        provider.setCustomParameters({
            prompt: "select_account"
        });

        const result =
            await signInWithPopup(
                auth,
                provider
            );

        if (
            result &&
            result.user
        ) {

            const email =
                result.user.email ||
                "";

            if (!email) {

                throw new Error(
                    "Google account email was not received."
                );

            }

            await loginSuccess(email);

        }

    } catch (err) {

        console.error(
            "Google Login Error:",
            err
        );

        let message =
            "Google Sign-In Error\n\n";

        if (err.code) {

            message +=
                "Code: " +
                err.code +
                "\n\n";

        }

        message +=
            err.message ||
            "Google login failed.";

        if (
            err.code ===
            "auth/unauthorized-domain"
        ) {

            message +=
                "\n\nFirebase Console එකේ Authentication → Settings → Authorized domains තුළ ඔයාගේ website domain එක add කරලා තියෙනවාද බලන්න.";

        }

        if (
            err.code ===
            "auth/popup-blocked"
        ) {

            message +=
                "\n\nBrowser එකේ popup blocking disable කරන්න.";

        }

        if (
            err.code ===
            "auth/popup-closed-by-user"
        ) {

            message =
                "Google login popup එක close කරලා තියෙනවා.";

        }

        alert(message);

    }

};


/* =========================================================
   FACEBOOK LOGIN
========================================================= */

window.triggerFacebookLogin = async function () {

    try {

        const provider =
            new FacebookAuthProvider();

        provider.setCustomParameters({
            display: "popup"
        });

        const result =
            await signInWithPopup(
                auth,
                provider
            );

        if (
            result &&
            result.user
        ) {

            const email =
                result.user.email ||
                "facebook_user@commerce-with-damith.com";

            await loginSuccess(email);

        }

    } catch (err) {

        console.error(
            "Facebook Login Error:",
            err
        );

        let message =
            "Facebook Sign-In Error\n\n";

        if (err.code) {

            message +=
                "Code: " +
                err.code +
                "\n\n";

        }

        message +=
            err.message ||
            "Facebook login failed.";

        alert(message);

    }

};


/* =========================================================
   EMAIL + PASSWORD LOGIN
========================================================= */

window.loginWithEmailPassword =
    async function () {

        const emailInput =
            document.getElementById(
                "loginEmail"
            );

        const passwordInput =
            document.getElementById(
                "loginPassword"
            );


        const email =
            emailInput
                ? emailInput.value.trim()
                : "";

        const password =
            passwordInput
                ? passwordInput.value
                : "";


        if (!email) {

            alert(
                "Email address එක ඇතුළත් කරන්න."
            );

            if (emailInput) {
                emailInput.focus();
            }

            return;

        }


        if (!password) {

            alert(
                "Password එක ඇතුළත් කරන්න."
            );

            if (passwordInput) {
                passwordInput.focus();
            }

            return;

        }


        try {

            const result =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            if (
                result &&
                result.user
            ) {

                await loginSuccess(
                    result.user.email ||
                    email
                );

            }

        } catch (err) {

            console.error(
                "Email Password Login Error:",
                err
            );

            let message =
                "Login failed.\n\n";

            if (err.code) {

                message +=
                    "Code: " +
                    err.code +
                    "\n\n";

            }

            switch (err.code) {

                case "auth/invalid-credential":

                    message +=
                        "Email හෝ Password එක වැරදියි.";

                    break;

                case "auth/invalid-email":

                    message +=
                        "Email address එක නිවැරදි නැහැ.";

                    break;

                case "auth/user-not-found":

                    message +=
                        "මෙම Email එකෙන් account එකක් හමු වුණේ නැහැ.";

                    break;

                case "auth/wrong-password":

                    message +=
                        "Password එක වැරදියි.";

                    break;

                case "auth/too-many-requests":

                    message +=
                        "Login attempts වැඩි නිසා තාවකාලිකව block කර ඇත. පසුව නැවත උත්සාහ කරන්න.";

                    break;

                default:

                    message +=
                        err.message ||
                        "Unknown login error.";

            }

            alert(message);

        }

    };


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

window.togglePassword =
    function () {

        const input =
            document.getElementById(
                "loginPassword"
            );

        const eye =
            document.getElementById(
                "passwordEye"
            );


        if (!input) {

            return;

        }


        const isPassword =
            input.type === "password";


        input.type =
            isPassword
                ? "text"
                : "password";


        if (eye) {

            eye.className =
                isPassword
                    ? "fa-solid fa-eye-slash"
                    : "fa-solid fa-eye";

        }

    };


/* =========================================================
   LOGIN BUTTON EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const googleLoginBtn =
            document.getElementById(
                "googleLoginBtn"
            );

        if (googleLoginBtn) {

            googleLoginBtn.addEventListener(
                "click",
                window.triggerGoogleLogin
            );

        }


        const facebookLoginBtn =
            document.getElementById(
                "facebookLoginBtn"
            );

        if (facebookLoginBtn) {

            facebookLoginBtn.addEventListener(
                "click",
                window.triggerFacebookLogin
            );

        }

    }
);


/* =========================================================
   FIRESTORE - LOAD DATA
========================================================= */

window.cloudFetchData =
    async function () {

        try {

            /* -----------------------------------------
               SINGLE VIDEOS
            ----------------------------------------- */

            const singleDocRef =
                doc(
                    db,
                    "appData",
                    "singleVideosDoc"
                );


            const singleDocSnap =
                await getDoc(
                    singleDocRef
                );


            let sVideos = [];


            if (
                singleDocSnap.exists()
            ) {

                const data =
                    singleDocSnap.data();


                if (
                    Array.isArray(
                        data.videos
                    )
                ) {

                    sVideos =
                        data.videos;

                } else if (
                    Array.isArray(
                        data.singleVideos
                    )
                ) {

                    sVideos =
                        data.singleVideos;

                }

            }


            /* -----------------------------------------
               PLAYLISTS
            ----------------------------------------- */

            const plSnap =
                await getDocs(
                    collection(
                        db,
                        "playlists"
                    )
                );


            const pData = [];


            plSnap.forEach(
                function (d) {

                    const data =
                        d.data();


                    pData.push({

                        id:
                            data.id ||
                            d.id,

                        name:
                            data.name ||
                            "Untitled Playlist",

                        videos:
                            Array.isArray(
                                data.videos
                            )
                                ? data.videos
                                : []

                    });

                }
            );


            return {

                singleVideos:
                    sVideos,

                playlistsData:
                    pData

            };


        } catch (e) {

            console.error(
                "Firestore Fetch Error:",
                e
            );

            throw e;

        }

    };


/* =========================================================
   FIRESTORE - ADD PLAYLIST
========================================================= */

window.cloudAddPlaylistToDB =
    async function (plObj) {

        try {

            await setDoc(

                doc(
                    db,
                    "playlists",
                    plObj.id
                ),

                {

                    id:
                        plObj.id,

                    name:
                        plObj.name,

                    videos:
                        Array.isArray(
                            plObj.videos
                        )
                            ? plObj.videos
                            : []

                }

            );


            return true;


        } catch (e) {

            console.error(
                "Add Playlist Error:",
                e
            );

            throw e;

        }

    };


/* =========================================================
   FIRESTORE - ADD VIDEO
========================================================= */

window.cloudAddVideoToDB =
    async function (
        targetPlId,
        newVidObj,
        singleVideosArr,
        playlistsArr
    ) {

        try {

            if (
                targetPlId ===
                "none"
            ) {

                await setDoc(

                    doc(
                        db,
                        "appData",
                        "singleVideosDoc"
                    ),

                    {

                        videos:
                            Array.isArray(
                                singleVideosArr
                            )
                                ? singleVideosArr
                                : []

                    }

                );

            } else {

                const targetPl =
                    (
                        playlistsArr ||
                        []
                    ).find(
                        function (p) {

                            return (
                                p.id ===
                                targetPlId
                            );

                        }
                    );


                if (!targetPl) {

                    throw new Error(
                        "Selected playlist was not found."
                    );

                }


                await setDoc(

                    doc(
                        db,
                        "playlists",
                        targetPl.id
                    ),

                    {

                        id:
                            targetPl.id,

                        name:
                            targetPl.name,

                        videos:
                            Array.isArray(
                                targetPl.videos
                            )
                                ? targetPl.videos
                                : []

                    }

                );

            }


            return true;


        } catch (e) {

            console.error(
                "Add Video Error:",
                e
            );

            throw e;

        }

    };


/* =========================================================
   FIRESTORE - UPDATE DATABASE
========================================================= */

window.cloudUpdateDatabase =
    async function (
        singleVideosArr,
        playlistsArr
    ) {

        try {

            /* -----------------------------------------
               SINGLE VIDEOS
            ----------------------------------------- */

            await setDoc(

                doc(
                    db,
                    "appData",
                    "singleVideosDoc"
                ),

                {

                    videos:
                        Array.isArray(
                            singleVideosArr
                        )
                            ? singleVideosArr
                            : []

                }

            );


            /* -----------------------------------------
               PLAYLISTS
            ----------------------------------------- */

            if (
                Array.isArray(
                    playlistsArr
                )
            ) {

                for (
                    const pl
                    of playlistsArr
                ) {

                    if (
                        !pl ||
                        !pl.id
                    ) {

                        continue;

                    }


                    await setDoc(

                        doc(
                            db,
                            "playlists",
                            pl.id
                        ),

                        {

                            id:
                                pl.id,

                            name:
                                pl.name ||
                                "Untitled Playlist",

                            videos:
                                Array.isArray(
                                    pl.videos
                                )
                                    ? pl.videos
                                    : []

                        }

                    );

                }

            }


            return true;


        } catch (e) {

            console.error(
                "Cloud Update Error:",
                e
            );

            throw e;

        }

    };


/* =========================================================
   LOAD CLOUD DATA
========================================================= */

async function loadCloudData() {

    try {

        const dbRes =
            await window.cloudFetchData();


        singleVideos =
            Array.isArray(
                dbRes.singleVideos
            )
                ? dbRes.singleVideos
                : [];


        playlistsData =
            Array.isArray(
                dbRes.playlistsData
            )
                ? dbRes.playlistsData
                : [];


        localStorage.setItem(

            "vissaSingleVideos",

            JSON.stringify(
                singleVideos
            )

        );


        return true;


    } catch (e) {

        console.error(
            "loadCloudData Error:",
            e
        );

        alert(
            "Firestore data load කිරීමට නොහැකි විය.\n\n" +
            e.message
        );

        return false;

    }

}


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    "load",
    async function () {

        const loggedUser =
            localStorage.getItem(
                "vissaLoggedUser"
            );


        if (loggedUser) {

            const loaded =
                await loadCloudData();


            if (loaded) {

                initDashboard(
                    loggedUser
                );

            }

        }

    }
);


/* =========================================================
   SIDE MENU
========================================================= */

window.toggleSideMenu =
    function () {

        const drawer =
            document.getElementById(
                "sideDrawer"
            );

        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (
            drawer &&
            overlay
        ) {

            const isOpen =
                drawer.classList.contains(
                    "open"
                );


            if (isOpen) {

                drawer.classList.remove(
                    "open"
                );

                overlay.style.display =
                    "none";

            } else {

                drawer.classList.add(
                    "open"
                );

                overlay.style.display =
                    "block";

            }

        }

    };


/* =========================================================
   PAGE SWITCH
========================================================= */

window.switchPageView =
    function (page) {

        document
            .querySelectorAll(
                ".page-view"
            )
            .forEach(
                function (v) {

                    v.classList.remove(
                        "active-view"
                    );

                }
            );


        document
            .querySelectorAll(
                ".drawer-nav-item button"
            )
            .forEach(
                function (b) {

                    b.classList.remove(
                        "active"
                    );

                }
            );


        const targetMap = {

            home:
                "viewHome",

            comments:
                "viewComments",

            account:
                "viewAccount"

        };


        /*
           Make Money page is no longer required.
           If your HTML still has it, it will simply not
           be selected from the menu unless you add it back.
        */


        const targetView =
            document.getElementById(
                targetMap[page]
            );


        if (targetView) {

            targetView.classList.add(
                "active-view"
            );

        }


        const navBtn =
            document.getElementById(
                "nav" +
                page.charAt(0).toUpperCase() +
                page.slice(1)
            );


        if (navBtn) {

            navBtn.classList.add(
                "active"
            );

        }


        /*
           Close drawer directly instead of using
           toggle, so repeated calls cannot reopen it.
        */

        const drawer =
            document.getElementById(
                "sideDrawer"
            );

        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (drawer) {

            drawer.classList.remove(
                "open"
            );

        }


        if (overlay) {

            overlay.style.display =
                "none";

        }

    };


/* =========================================================
   COMMENTS
========================================================= */

window.postComment =
    function () {

        const commentInput =
            document.getElementById(
                "newCommentText"
            );


        const text =
            commentInput
                ? commentInput.value.trim()
                : "";


        const loggedUser =
            localStorage.getItem(
                "vissaLoggedUser"
            ) ||
            "User";


        if (!text) {

            alert(
                "කරුණාකර Comment එකක් ලියන්න!"
            );

            return;

        }


        const list =
            document.getElementById(
                "commentsList"
            );


        if (list) {

            const newComment =
                document.createElement(
                    "div"
                );


            newComment.style =
                "background:#222;" +
                "border-radius:8px;" +
                "padding:15px;" +
                "margin-bottom:12px;" +
                "border-left:3px solid #ff0000;";


            /*
               textContent is used for the user comment
               so HTML entered into the comment is not executed.
            */

            const userDiv =
                document.createElement(
                    "div"
                );

            userDiv.style =
                "font-size:0.85rem;" +
                "color:#ff0000;" +
                "font-weight:bold;" +
                "margin-bottom:4px;";

            userDiv.textContent =
                loggedUser;


            const textDiv =
                document.createElement(
                    "div"
                );

            textDiv.style =
                "font-size:0.95rem;" +
                "color:#ddd;";

            textDiv.textContent =
                text;


            newComment.appendChild(
                userDiv
            );

            newComment.appendChild(
                textDiv
            );


            list.prepend(
                newComment
            );

        }


        if (commentInput) {

            commentInput.value = "";

        }

    };


/* =========================================================
   EMAIL AUTH MODAL
========================================================= */

window.openEmailModal =
    function () {

        const modal =
            document.getElementById(
                "emailAuthModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }

    };


window.closeAuthModal =
    function () {

        const modal =
            document.getElementById(
                "emailAuthModal"
            );


        if (modal) {

            modal.style.display =
                "none";

        }

    };


/* =========================================================
   EMAILJS OTP
========================================================= */

window.sendOTPCode =
    function () {

        const emailInput =
            document.getElementById(
                "userEmailInput"
            );


        const userEmail =
            emailInput
                ? emailInput.value.trim()
                : "";


        if (
            !userEmail ||
            !userEmail.includes("@")
        ) {

            alert(
                "කරුණාකර නිවැරදි Email එකක් ඇතුළත් කරන්න!"
            );

            return;

        }


        pendingEmail =
            userEmail;


        generatedOTP =
            Math.floor(
                100000 +
                Math.random() *
                900000
            ).toString();


        if (
            typeof emailjs ===
            "undefined"
        ) {

            alert(
                "EmailJS library එක load වී නැත."
            );

            return;

        }


        emailjs.send(

            "service_0dhcgr3",

            "template_cu3r1wj",

            {

                email:
                    userEmail,

                passcode:
                    generatedOTP

            }

        )

        .then(
            function () {

                alert(
                    "Verification Code එක " +
                    userEmail +
                    " වෙත යවන ලදී."
                );


                const step1 =
                    document.getElementById(
                        "otpStep1"
                    );


                const step2 =
                    document.getElementById(
                        "otpStep2"
                    );


                if (step1) {

                    step1.style.display =
                        "none";

                }


                if (step2) {

                    step2.style.display =
                        "block";

                }

            }
        )

        .catch(
            function (err) {

                console.error(
                    "EmailJS Error:",
                    err
                );


                alert(
                    "Email යැවීමේදී දෝෂයක්:\n\n" +
                    (
                        err.text ||
                        err.message ||
                        JSON.stringify(err)
                    )
                );

            }
        );

    };


/* =========================================================
   VERIFY OTP
========================================================= */

window.verifyOTPCode =
    function () {

        const otpInput =
            document.getElementById(
                "otpInput"
            );


        const enteredOTP =
            otpInput
                ? otpInput.value.trim()
                : "";


        if (
            generatedOTP &&
            enteredOTP ===
            generatedOTP
        ) {

            const verifiedEmail =
                pendingEmail;


            generatedOTP =
                null;


            pendingEmail =
                "";


            window.closeAuthModal();


            loginSuccess(
                verifiedEmail
            );


        } else {

            alert(
                "වැරදි Verification Code එකකි!"
            );

        }

    };


/* =========================================================
   LOGIN SUCCESS
========================================================= */

async function loginSuccess(email) {

    if (!email) {

        throw new Error(
            "Login email is missing."
        );

    }


    localStorage.setItem(
        "vissaLoggedUser",
        email
    );


    const loaded =
        await loadCloudData();


    if (!loaded) {

        return;

    }


    initDashboard(
        email
    );

}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

function initDashboard(email) {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );


    const appScreen =
        document.getElementById(
            "appScreen"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }


    if (appScreen) {

        appScreen.style.display =
            "flex";

    }


    const displayUserEmail =
        document.getElementById(
            "displayUserEmail"
        );


    const accEmail =
        document.getElementById(
            "accEmail"
        );


    if (displayUserEmail) {

        displayUserEmail.innerText =
            email;

    }


    if (accEmail) {

        accEmail.innerText =
            email;

    }


    const roleElem =
        document.getElementById(
            "displayUserRole"
        );


    const fabElem =
        document.getElementById(
            "fabContainer"
        );


    if (
        email.toLowerCase() ===
        MY_ADMIN_GMAIL.toLowerCase()
    ) {

        if (roleElem) {

            roleElem.innerText =
                "Admin (Creator)";

            roleElem.className =
                "badge-role admin";

        }


        if (fabElem) {

            fabElem.style.display =
                "flex";

        }


        isAdminLoggedIn =
            true;


    } else {

        if (roleElem) {

            roleElem.innerText =
                "Viewer";

            roleElem.className =
                "badge-role";

        }


        if (fabElem) {

            fabElem.style.display =
                "none";

        }


        isAdminLoggedIn =
            false;

    }


    render();

}


/* =========================================================
   LOGOUT
========================================================= */

window.logout =
    async function () {

        try {

            await signOut(
                auth
            );

        } catch (e) {

            console.error(
                "Firebase Logout Error:",
                e
            );

        }


        localStorage.removeItem(
            "vissaLoggedUser"
        );


        isAdminLoggedIn =
            false;


        const appScreen =
            document.getElementById(
                "appScreen"
            );


        const loginScreen =
            document.getElementById(
                "loginScreen"
            );


        if (appScreen) {

            appScreen.style.display =
                "none";

        }


        if (loginScreen) {

            loginScreen.style.display =
                "flex";

        }

    };


/* =========================================================
   ADMIN FAB
========================================================= */

window.toggleFab =
    function () {

        const fab =
            document.getElementById(
                "fabContainer"
            );


        if (fab) {

            fab.classList.toggle(
                "active"
            );

        }

    };


/* =========================================================
   MAIN VIDEO / PLAYLIST VIEW
========================================================= */

window.switchMainView =
    function (view) {

        currentView =
            view;


        selectedPlaylistId =
            null;


        const tabVideos =
            document.getElementById(
                "tabAllVideosBtn"
            );


        const tabPlaylists =
            document.getElementById(
                "tabPlaylistsBtn"
            );


        if (tabVideos) {

            tabVideos.classList.toggle(
                "active",
                view === "videos"
            );

        }


        if (tabPlaylists) {

            tabPlaylists.classList.toggle(
                "active",
                view === "playlists"
            );

        }


        render();

    };


/* =========================================================
   RENDER
========================================================= */

function render() {

    const container =
        document.getElementById(
            "mainContent"
        );


    const subTabs =
        document.getElementById(
            "playlistSubTabs"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (subTabs) {

        subTabs.style.display =
            "none";

    }


    /* -----------------------------------------
       ALL VIDEOS
    ----------------------------------------- */

    if (
        currentView ===
        "videos"
    ) {

        let allCombined =
            [...singleVideos];


        playlistsData.forEach(
            function (pl) {

                if (
                    Array.isArray(
                        pl.videos
                    )
                ) {

                    allCombined =
                        allCombined.concat(
                            pl.videos
                        );

                }

            }
        );


        if (
            allCombined.length ===
            0
        ) {

            container.innerHTML = `

                <p
                    style="
                    color:#888;
                    text-align:center;
                    padding:40px;
                    "
                >
                    තවමත් වීඩියෝ නොමැත.
                </p>

            `;

            return;

        }


        renderVideoCards(
            allCombined,
            container,
            "none"
        );


        return;

    }


    /* -----------------------------------------
       PLAYLISTS
    ----------------------------------------- */

    if (
        currentView ===
        "playlists"
    ) {

        if (
            selectedPlaylistId ===
            null
        ) {

            if (
                playlistsData.length ===
                0
            ) {

                container.innerHTML = `

                    <p
                        style="
                        color:#888;
                        text-align:center;
                        padding:40px;
                        "
                    >
                        තවමත් Playlists නොමැත.
                    </p>

                `;

                return;

            }


            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "playlist-grid";


            playlistsData.forEach(
                function (pl) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "playlist-card animated-box-frame";


                    card.onclick =
                        function () {

                            selectedPlaylistId =
                                pl.id;

                            render();

                        };


                    const videoCount =
                        Array.isArray(
                            pl.videos
                        )
                            ? pl.videos.length
                            : 0;


                    card.innerHTML = `

                        <i
                            class="fa-solid fa-layer-group"
                        ></i>

                        <h3>
                            ${escapeHTML(
                                pl.name
                            )}
                        </h3>

                        <span
                            style="
                            color:#777;
                            font-size:0.85rem;
                            "
                        >
                            ${videoCount}
                            Videos
                        </span>

                    `;


                    grid.appendChild(
                        card
                    );

                }
            );


            container.appendChild(
                grid
            );


        } else {

            if (subTabs) {

                subTabs.style.display =
                    "flex";

            }


            renderSubTabs();


            const currentPl =
                playlistsData.find(
                    function (pl) {

                        return (
                            pl.id ===
                            selectedPlaylistId
                        );

                    }
                );


            if (currentPl) {

                renderVideoCards(

                    Array.isArray(
                        currentPl.videos
                    )
                        ? currentPl.videos
                        : [],

                    container,

                    currentPl.id

                );

            }

        }

    }

}


/* =========================================================
   PLAYLIST SUB TABS
========================================================= */

function renderSubTabs() {

    const subTabs =
        document.getElementById(
            "playlistSubTabs"
        );


    if (!subTabs) {

        return;

    }


    subTabs.innerHTML = `

        <button
            class="sub-tab-btn animated-box-frame"
            onclick="
                selectedPlaylistId = null;
                render();
            "
        >

            <i
                class="fa-solid fa-arrow-left"
            ></i>

            All Playlists

        </button>

    `;


    playlistsData.forEach(
        function (pl) {

            const btn =
                document.createElement(
                    "button"
                );


            btn.className =
                "sub-tab-btn animated-box-frame " +
                (
                    pl.id ===
                    selectedPlaylistId
                        ? "active"
                        : ""
                );


            btn.innerText =
                pl.name;


            btn.onclick =
                function () {

                    selectedPlaylistId =
                        pl.id;

                    render();

                };


            subTabs.appendChild(
                btn
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}


/* =========================================================
   VIDEO CARDS
========================================================= */

function renderVideoCards(
    videos,
    targetElem,
    playlistContextId
) {

    if (
        !Array.isArray(
            videos
        )
    ) {

        return;

    }


    videos.forEach(
        function (vid) {

            if (
                !vid ||
                !vid.id
            ) {

                return;

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "video-container animated-box-frame";


            let deleteButtonHTML =
                "";


            if (isAdminLoggedIn) {

                const vidIdentifier =
                    vid.firebaseId ||
                    vid.id;


                deleteButtonHTML = `

                    <button
                        onclick="
                            removeVideo(
                                '${escapeAttribute(
                                    playlistContextId
                                )}',
                                '${escapeAttribute(
                                    vidIdentifier
                                )}'
                            )
                        "
                        style="
                        background:#ff4d4d;
                        color:white;
                        border:none;
                        padding:6px 12px;
                        border-radius:6px;
                        cursor:pointer;
                        margin-top:10px;
                        font-weight:bold;
                        "
                    >

                        <i
                            class="fa-solid fa-trash"
                        ></i>

                        Delete Video

                    </button>

                `;

            }


            const title =
                escapeHTML(
                    vid.title ||
                    "Untitled Video"
                );


            const description =
                escapeHTML(
                    vid.description ||
                    ""
                );


            const videoId =
                encodeURIComponent(
                    vid.id
                );


            card.innerHTML = `

                <div
                    class="video-wrapper"
                >

                    <iframe
                        src="https://www.youtube.com/embed/${videoId}"
                        title="${title}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>

                </div>


                <div
                    class="video-details"
                >

                    <h2
                        class="video-title"
                    >
                        ${title}
                    </h2>


                    <div
                        class="video-description"
                    >
                        ${description}
                    </div>


                    <div
                        style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        flex-wrap:wrap;
                        gap:10px;
                        "
                    >

                        <a
                            href="https://www.youtube.com/watch?v=${videoId}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="yt-btn"
                        >

                            <i
                                class="fa-brands fa-youtube"
                            ></i>

                            Watch on YouTube

                        </a>


                        ${deleteButtonHTML}

                    </div>

                </div>

            `;


            targetElem.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return String(
        value == null
            ? ""
            : value
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );

}


/* =========================================================
   ADD PLAYLIST
========================================================= */

window.addPlaylist =
    async function () {

        if (!isAdminLoggedIn) {

            alert(
                "Admin access required."
            );

            return;

        }


        const nameInput =
            document.getElementById(
                "playlistNameInput"
            );


        const name =
            nameInput
                ? nameInput.value.trim()
                : "";


        if (!name) {

            alert(
                "කරුණාකර Playlist Name එකක් ඇතුළත් කරන්න!"
            );

            return;

        }


        const newPl = {

            id:
                "pl_" +
                Date.now(),

            name:
                name,

            videos:
                []

        };


        try {

            await window.cloudAddPlaylistToDB(
                newPl
            );


            playlistsData.push(
                newPl
            );


            closeAdminModals();


            if (nameInput) {

                nameInput.value =
                    "";

            }


            switchMainView(
                "playlists"
            );


            alert(
                "Playlist එක සාර්ථකව සාදන ලදී."
            );


        } catch (e) {

            console.error(
                "Playlist save error:",
                e
            );


            alert(
                "Playlist save කිරීමට නොහැකි විය:\n\n" +
                e.message
            );

        }

    };


/* =========================================================
   EXTRACT YOUTUBE VIDEO ID
========================================================= */

function extractVideoID(url) {

    try {

        const parsed =
            new URL(
                url
            );


        const hostname =
            parsed.hostname
                .toLowerCase();


        /* -----------------------------------------
           youtu.be/VIDEO_ID
        ----------------------------------------- */

        if (
            hostname ===
                "youtu.be" ||
            hostname.endsWith(
                ".youtu.be"
            )
        ) {

            const id =
                parsed.pathname
                    .replace(
                        /^\/+/,
                        ""
                    )
                    .split("/")[0];


            return id &&
                id.length === 11
                ? id
                : null;

        }


        /* -----------------------------------------
           youtube.com/watch?v=VIDEO_ID
        ----------------------------------------- */

        if (
            hostname.includes(
                "youtube.com"
            )
        ) {

            const v =
                parsed.searchParams.get(
                    "v"
                );


            if (
                v &&
                v.length === 11
            ) {

                return v;

            }


            /* -------------------------------------
               /embed/VIDEO_ID
            ------------------------------------- */

            const parts =
                parsed.pathname
                    .split("/")
                    .filter(
                        Boolean
                    );


            const embedIndex =
                parts.indexOf(
                    "embed"
                );


            if (
                embedIndex !== -1 &&
                parts[embedIndex + 1]
            ) {

                const id =
                    parts[
                        embedIndex + 1
                    ];


                return id.length === 11
                    ? id
                    : null;

            }


            /* -------------------------------------
               /shorts/VIDEO_ID
            ------------------------------------- */

            const shortsIndex =
                parts.indexOf(
                    "shorts"
                );


            if (
                shortsIndex !== -1 &&
                parts[shortsIndex + 1]
            ) {

                const id =
                    parts[
                        shortsIndex + 1
                    ];


                return id.length === 11
                    ? id
                    : null;

            }


            /* -------------------------------------
               /live/VIDEO_ID
            ------------------------------------- */

            const liveIndex =
                parts.indexOf(
                    "live"
                );


            if (
                liveIndex !== -1 &&
                parts[liveIndex + 1]
            ) {

                const id =
                    parts[
                        liveIndex + 1
                    ];


                return id.length === 11
                    ? id
                    : null;

            }

        }


    } catch (e) {

        console.error(
            "YouTube URL Parse Error:",
            e
        );

    }


    return null;

}


/* =========================================================
   ADD VIDEO
========================================================= */

window.addVideo =
    async function () {

        if (!isAdminLoggedIn) {

            alert(
                "Admin access required."
            );

            return;

        }


        const targetPlEl =
            document.getElementById(
                "playlistSelect"
            );


        const linkInputEl =
            document.getElementById(
                "ytLinkInput"
            );


        const targetPlId =
            targetPlEl
                ? targetPlEl.value
                : "none";


        const linkInput =
            linkInputEl
                ? linkInputEl.value.trim()
                : "";


        const titleInputElem =
            document.getElementById(
                "customTitle"
            );


        const descInputElem =
            document.getElementById(
                "customDesc"
            );


        const title =
            (
                titleInputElem &&
                titleInputElem.value.trim()
            )
                ? titleInputElem.value.trim()
                : "OL Commerce With Damith";


        const description =
            (
                descInputElem &&
                descInputElem.value.trim()
            )
                ? descInputElem.value.trim()
                : "මෙම වීඩියෝව OL Commerce With Damith හරහා නරඹන්න.";


        if (!linkInput) {

            alert(
                "කරුණාකර YouTube Link එකක් ඇතුළත් කරන්න!"
            );

            return;

        }


        const videoId =
            extractVideoID(
                linkInput
            );


        if (
            !videoId ||
            videoId.length !== 11
        ) {

            alert(
                "නිවැරදි YouTube Video Link එකක් ඇතුළත් කරන්න!"
            );

            return;

        }


        const newVidObj = {

            firebaseId:
                "vid_" +
                Date.now(),

            id:
                videoId,

            title:
                title,

            description:
                description

        };


        try {

            let nextSingleVideos =
                [
                    ...singleVideos
                ];


            let nextPlaylistsData =
                playlistsData.map(
                    function (pl) {

                        return {

                            ...pl,

                            videos:
                                Array.isArray(
                                    pl.videos
                                )
                                    ? [
                                        ...pl.videos
                                    ]
                                    : []

                        };

                    }
                );


            if (
                targetPlId ===
                "none"
            ) {

                nextSingleVideos.unshift(
                    newVidObj
                );


            } else {

                const targetPl =
                    nextPlaylistsData.find(
                        function (pl) {

                            return (
                                pl.id ===
                                targetPlId
                            );

                        }
                    );


                if (!targetPl) {

                    alert(
                        "Selected playlist එක හමු වුණේ නැහැ."
                    );

                    return;

                }


                targetPl.videos.unshift(
                    newVidObj
                );

            }


            await window.cloudAddVideoToDB(

                targetPlId,

                newVidObj,

                nextSingleVideos,

                nextPlaylistsData

            );


            singleVideos =
                nextSingleVideos;


            playlistsData =
                nextPlaylistsData;


            localStorage.setItem(

                "vissaSingleVideos",

                JSON.stringify(
                    singleVideos
                )

            );


            closeAdminModals();


            if (linkInputEl) {

                linkInputEl.value =
                    "";

            }


            if (titleInputElem) {

                titleInputElem.value =
                    "";

            }


            if (descInputElem) {

                descInputElem.value =
                    "";

            }


            render();


            alert(
                "Video එක, Title එක සහ Description එක සාර්ථකව Save විය!"
            );


        } catch (e) {

            console.error(
                "Video save error:",
                e
            );


            alert(
                "Video save කිරීමට නොහැකි විය:\n\n" +
                e.message
            );

        }

    };


/* =========================================================
   REMOVE VIDEO
========================================================= */

window.removeVideo =
    async function (
        playlistId,
        videoFirebaseId
    ) {

        if (!isAdminLoggedIn) {

            alert(
                "Admin access required."
            );

            return;

        }


        if (
            !confirm(
                "මෙම වීඩියෝව ඉවත් කිරීමට ඔබට අවශ්‍ය බව විශ්වාසද?"
            )
        ) {

            return;

        }


        try {

            let nextSingleVideos =
                [
                    ...singleVideos
                ];


            let nextPlaylistsData =
                playlistsData.map(
                    function (pl) {

                        return {

                            ...pl,

                            videos:
                                Array.isArray(
                                    pl.videos
                                )
                                    ? [
                                        ...pl.videos
                                    ]
                                    : []

                        };

                    }
                );


            if (
                playlistId ===
                "none"
            ) {

                nextSingleVideos =
                    nextSingleVideos.filter(
                        function (v) {

                            return (
                                v.firebaseId !==
                                    videoFirebaseId &&
                                v.id !==
                                    videoFirebaseId
                            );

                        }
                    );


            } else {

                const targetPl =
                    nextPlaylistsData.find(
                        function (pl) {

                            return (
                                pl.id ===
                                playlistId
                            );

                        }
                    );


                if (targetPl) {

                    targetPl.videos =
                        targetPl.videos.filter(
                            function (v) {

                                return (
                                    v.firebaseId !==
                                        videoFirebaseId &&
                                    v.id !==
                                        videoFirebaseId
                                );

                            }
                        );

                }

            }


            await window.cloudUpdateDatabase(

                nextSingleVideos,

                nextPlaylistsData

            );


            singleVideos =
                nextSingleVideos;


            playlistsData =
                nextPlaylistsData;


            localStorage.setItem(

                "vissaSingleVideos",

                JSON.stringify(
                    singleVideos
                )

            );


            render();


            alert(
                "වීඩියෝව සාර්ථකව ඉවත් කරන ලදී!"
            );


        } catch (e) {

            console.error(
                "Remove Video Error:",
                e
            );


            alert(
                "වීඩියෝව ඉවත් කිරීම අසාර්ථක විය:\n\n" +
                e.message
            );

        }

    };


/* =========================================================
   PLAYLIST MODAL
========================================================= */

window.openPlaylistModal =
    function () {

        if (!isAdminLoggedIn) {

            alert(
                "Admin access required."
            );

            return;

        }


        toggleFab();


        const modal =
            document.getElementById(
                "playlistModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }

    };


/* =========================================================
   VIDEO MODAL
========================================================= */

window.openVideoModal =
    function () {

        if (!isAdminLoggedIn) {

            alert(
                "Admin access required."
            );

            return;

        }


        toggleFab();


        const select =
            document.getElementById(
                "playlistSelect"
            );


        if (select) {

            select.innerHTML =
                `
                <option value="none">
                    -- None (Single Video / Direct Upload) --
                </option>
                `;


            playlistsData.forEach(
                function (pl) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        pl.id;


                    option.textContent =
                        pl.name;


                    select.appendChild(
                        option
                    );

                }
            );

        }


        const modal =
            document.getElementById(
                "videoModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }

    };


/* =========================================================
   CLOSE ADMIN MODALS
========================================================= */

window.closeAdminModals =
    function () {

        const plModal =
            document.getElementById(
                "playlistModal"
            );


        const vidModal =
            document.getElementById(
                "videoModal"
            );


        if (plModal) {

            plModal.style.display =
                "none";

        }


        if (vidModal) {

            vidModal.style.display =
                "none";

        }

    };


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Global JavaScript Error:",
            event.error ||
            event.message
        );

    }
);


window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Unhandled Promise Error:",
            event.reason
        );

    }
);


/* =========================================================
   END OF INDEX.JS
========================================================= */
