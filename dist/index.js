"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/index.ts
var index_exports = {};
__export(index_exports, {
  VHPCaptcha: () => VHPCaptcha_default,
  initVHP: () => initVHP
});
module.exports = __toCommonJS(index_exports);

// src/components/VHPCaptcha.tsx
var import_react4 = __toESM(require("react"));
var import_framer_motion = require("framer-motion");

// src/components/ChallengeMode.tsx
var import_react2 = __toESM(require("react"));

// src/components/CameraCapture.tsx
var import_react = __toESM(require("react"));
var import_react_webcam = __toESM(require("react-webcam"));
var CameraCapture = ({
  onCapture,
  onCancel,
  facingMode = "user"
}) => {
  const webcamRef = (0, import_react.useRef)(null);
  const [countdown, setCountdown] = (0, import_react.useState)(null);
  const capture = (0, import_react.useCallback)(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);
  const startCapture = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          capture();
          return null;
        }
        return prev - 1;
      });
    }, 1e3);
  };
  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "relative flex-1 flex flex-col" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "relative aspect-square bg-black rounded-lg overflow-hidden mb-4" }, /* @__PURE__ */ import_react.default.createElement(
    import_react_webcam.default,
    {
      ref: webcamRef,
      screenshotFormat: "image/jpeg",
      videoConstraints,
      className: "w-full h-full object-cover"
    }
  ), countdown !== null && /* @__PURE__ */ import_react.default.createElement("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "text-6xl font-bold text-white animate-ping" }, countdown), "w")), /* @__PURE__ */ import_react.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: onCancel,
      className: "flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
    },
    "Cancel"
  ), /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      onClick: startCapture,
      disabled: countdown !== null,
      className: "flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium"
    },
    countdown !== null ? "Capturing..." : "Capture"
  )));
};
var CameraCapture_default = CameraCapture;

// src/components/ChallengeMode.tsx
var ChallengeMode = ({
  onSuccess,
  onFailed,
  apiEndpoint
}) => {
  const [stage, setStage] = (0, import_react2.useState)("loading");
  const [challenge, setChallenge] = (0, import_react2.useState)(null);
  const [capturedMedia, setCapturedMedia] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
    setTimeout(() => {
      setChallenge({
        id: "ch_" + Math.random().toString(36).substr(2, 9),
        title: "Selfie Verification",
        description: "Take a selfie with your hand making a peace sign",
        type: "selfie"
      });
      setStage("display");
    }, 1e3);
  }, []);
  const handleStartCapture = () => {
    setStage("capture");
  };
  const handleCaptureComplete = (mediaData) => {
    setCapturedMedia(mediaData);
    setStage("verifying");
    setTimeout(() => {
      const mockToken = "vhp_" + Math.random().toString(36).substr(2, 9);
      onSuccess(mockToken);
    }, 2e3);
  };
  const handleReroll = () => {
    setStage("loading");
    setTimeout(() => {
      setChallenge({
        id: "ch_" + Math.random().toString(36).substr(2, 9),
        title: "Daily Challenge",
        description: "Show something blue in your surroundings",
        type: "photo"
      });
      setStage("display");
    }, 500);
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 flex flex-col" }, stage === "loading" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 flex items-center justify-center" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" })), stage === "display" && challenge && /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 flex flex-col" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "bg-gray-800 rounded-lg p-4 mb-4" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ import_react2.default.createElement("h4", { className: "font-semibold" }, challenge.title), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      onClick: handleReroll,
      className: "text-gray-400 hover:text-white",
      title: "Get different challenge"
    },
    /* @__PURE__ */ import_react2.default.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react2.default.createElement("path", { d: "M1 4v6h6M23 20v-6h-6" }), /* @__PURE__ */ import_react2.default.createElement("path", { d: "M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" }))
  )), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-sm text-gray-300" }, challenge.description)), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      onClick: handleStartCapture,
      className: "mt-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
    },
    "Start Challenge"
  )), stage === "capture" && /* @__PURE__ */ import_react2.default.createElement(
    CameraCapture_default,
    {
      onCapture: handleCaptureComplete,
      onCancel: () => setStage("display"),
      facingMode: (challenge == null ? void 0 : challenge.type) === "selfie" ? "user" : "environment"
    }
  ), stage === "verifying" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 flex flex-col items-center justify-center" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-gray-300" }, "Verifying submission...")));
};
var ChallengeMode_default = ChallengeMode;

// src/components/LoginMode.tsx
var import_react3 = __toESM(require("react"));
var LoginMode = ({
  onSuccess,
  onFailed,
  apiEndpoint
}) => {
  const [stage, setStage] = (0, import_react3.useState)("login");
  const [nocenaId, setNocenaId] = (0, import_react3.useState)("");
  const handleLogin = async () => {
    if (!nocenaId) {
      onFailed("Please enter your Nocena ID");
      return;
    }
    setStage("selfie");
  };
  const handleSelfieCapture = async (imageData) => {
    setStage("verifying");
    setTimeout(() => {
      const mockToken = "vhp_login_" + Math.random().toString(36).substr(2, 9);
      onSuccess(mockToken);
    }, 2e3);
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 flex flex-col" }, stage === "login" && /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 flex flex-col" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mb-6" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm text-gray-300 mb-4" }, "Login with your Nocena profile to verify you're human. You must have completed at least 3 challenges in the past month."), /* @__PURE__ */ import_react3.default.createElement(
    "input",
    {
      type: "text",
      value: nocenaId,
      onChange: (e) => setNocenaId(e.target.value),
      placeholder: "Enter your Nocena ID",
      className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
    }
  )), /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: handleLogin,
      className: "mt-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
    },
    "Continue with Nocena"
  )), stage === "selfie" && /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 flex flex-col" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mb-4" }, /* @__PURE__ */ import_react3.default.createElement("h4", { className: "font-semibold mb-2" }, "Selfie Verification"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm text-gray-300" }, "Take a selfie to verify your identity")), /* @__PURE__ */ import_react3.default.createElement(
    CameraCapture_default,
    {
      onCapture: handleSelfieCapture,
      onCancel: () => setStage("login"),
      facingMode: "user"
    }
  )), stage === "verifying" && /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 flex flex-col items-center justify-center" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-gray-300" }, "Verifying your Nocena profile...")));
};
var LoginMode_default = LoginMode;

// src/components/VHPCaptcha.tsx
var VHPCaptcha = ({
  onVerified,
  onFailed,
  apiEndpoint = "/api/vhp/verify",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = (0, import_react4.useState)(false);
  const [mode, setMode] = (0, import_react4.useState)("initial");
  const [verificationToken, setVerificationToken] = (0, import_react4.useState)(null);
  const handleClick = () => {
    if (mode === "initial") {
      setIsExpanded(true);
      setMode("challenge");
    }
  };
  const handleVerificationSuccess = (token) => {
    setVerificationToken(token);
    setMode("success");
    onVerified(token);
    setTimeout(() => {
      setIsExpanded(false);
      setMode("initial");
    }, 2e3);
  };
  const handleVerificationFailed = (error) => {
    setMode("failed");
    if (onFailed) onFailed(error);
  };
  const resetState = () => {
    setMode("challenge");
  };
  return /* @__PURE__ */ import_react4.default.createElement(
    import_framer_motion.motion.div,
    {
      className: `relative bg-gray-900 text-white rounded-lg overflow-hidden ${className}`,
      animate: {
        width: isExpanded ? "400px" : "300px",
        height: isExpanded ? "500px" : "74px"
      },
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    mode === "initial" && /* @__PURE__ */ import_react4.default.createElement(
      "button",
      {
        onClick: handleClick,
        className: "w-full h-full flex items-center justify-between px-4 hover:bg-gray-800 transition-colors"
      },
      /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center" }, /* @__PURE__ */ import_react4.default.createElement(
        "svg",
        {
          className: "w-4 h-4",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2"
        },
        /* @__PURE__ */ import_react4.default.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })
      )), /* @__PURE__ */ import_react4.default.createElement("span", { className: "font-medium" }, "Verify you're human")),
      /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-xs text-gray-400" }, "Powered by Nocena")
    ),
    /* @__PURE__ */ import_react4.default.createElement(import_framer_motion.AnimatePresence, null, isExpanded && /* @__PURE__ */ import_react4.default.createElement(
      import_framer_motion.motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "p-4 h-full flex flex-col"
      },
      (mode === "challenge" || mode === "login") && /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ import_react4.default.createElement("h3", { className: "text-lg font-semibold" }, mode === "challenge" ? "Complete Challenge" : "Login with Nocena"), /* @__PURE__ */ import_react4.default.createElement(
        "button",
        {
          onClick: () => setMode(mode === "challenge" ? "login" : "challenge"),
          className: "text-sm text-blue-400 hover:text-blue-300"
        },
        mode === "challenge" ? "Login instead" : "Complete challenge"
      )),
      mode === "challenge" && /* @__PURE__ */ import_react4.default.createElement(
        ChallengeMode_default,
        {
          onSuccess: handleVerificationSuccess,
          onFailed: handleVerificationFailed,
          apiEndpoint
        }
      ),
      mode === "login" && /* @__PURE__ */ import_react4.default.createElement(
        LoginMode_default,
        {
          onSuccess: handleVerificationSuccess,
          onFailed: handleVerificationFailed,
          apiEndpoint
        }
      ),
      mode === "success" && /* @__PURE__ */ import_react4.default.createElement(
        import_framer_motion.motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          className: "flex-1 flex flex-col items-center justify-center text-center"
        },
        /* @__PURE__ */ import_react4.default.createElement("div", { className: "w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4" }, /* @__PURE__ */ import_react4.default.createElement("svg", { className: "w-8 h-8", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react4.default.createElement("path", { d: "M20 6L9 17l-5-5" }))),
        /* @__PURE__ */ import_react4.default.createElement("h3", { className: "text-xl font-semibold text-green-400" }, "Verified!"),
        /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-sm text-gray-400 mt-2" }, "You're human. Token earned!")
      ),
      mode === "failed" && /* @__PURE__ */ import_react4.default.createElement(
        import_framer_motion.motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          className: "flex-1 flex flex-col items-center justify-center text-center"
        },
        /* @__PURE__ */ import_react4.default.createElement("div", { className: "w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4" }, /* @__PURE__ */ import_react4.default.createElement("svg", { className: "w-8 h-8", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react4.default.createElement("path", { d: "M18 6L6 18M6 6l12 12" }))),
        /* @__PURE__ */ import_react4.default.createElement("h3", { className: "text-xl font-semibold text-red-400" }, "Verification Failed"),
        /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-sm text-gray-400 mt-2" }, "Please try again"),
        /* @__PURE__ */ import_react4.default.createElement(
          "button",
          {
            onClick: resetState,
            className: "mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
          },
          "Try Again"
        )
      )
    ))
  );
};
var VHPCaptcha_default = VHPCaptcha;

// src/lib/index.ts
var initVHP = (config) => {
  console.log("VHP initialized with config:", config);
  return {
    version: "0.1.0",
    config
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VHPCaptcha,
  initVHP
});
