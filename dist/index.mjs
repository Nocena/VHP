// src/components/VHPCaptcha.tsx
import React4, { useState as useState4 } from "react";
import { motion, AnimatePresence } from "framer-motion";

// src/components/ChallengeMode.tsx
import React2, { useState as useState2, useEffect } from "react";

// src/components/CameraCapture.tsx
import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
var CameraCapture = ({
  onCapture,
  onCancel,
  facingMode = "user"
}) => {
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const capture = useCallback(() => {
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
  return /* @__PURE__ */ React.createElement("div", { className: "relative flex-1 flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "relative aspect-square bg-black rounded-lg overflow-hidden mb-4" }, /* @__PURE__ */ React.createElement(
    Webcam,
    {
      ref: webcamRef,
      screenshotFormat: "image/jpeg",
      videoConstraints,
      className: "w-full h-full object-cover"
    }
  ), countdown !== null && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50" }, /* @__PURE__ */ React.createElement("span", { className: "text-6xl font-bold text-white animate-ping" }, countdown), "w")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onCancel,
      className: "flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
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
  const [stage, setStage] = useState2("loading");
  const [challenge, setChallenge] = useState2(null);
  const [capturedMedia, setCapturedMedia] = useState2(null);
  useEffect(() => {
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
  return /* @__PURE__ */ React2.createElement("div", { className: "flex-1 flex flex-col" }, stage === "loading" && /* @__PURE__ */ React2.createElement("div", { className: "flex-1 flex items-center justify-center" }, /* @__PURE__ */ React2.createElement("div", { className: "w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" })), stage === "display" && challenge && /* @__PURE__ */ React2.createElement("div", { className: "flex-1 flex flex-col" }, /* @__PURE__ */ React2.createElement("div", { className: "bg-gray-800 rounded-lg p-4 mb-4" }, /* @__PURE__ */ React2.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ React2.createElement("h4", { className: "font-semibold" }, challenge.title), /* @__PURE__ */ React2.createElement(
    "button",
    {
      onClick: handleReroll,
      className: "text-gray-400 hover:text-white",
      title: "Get different challenge"
    },
    /* @__PURE__ */ React2.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React2.createElement("path", { d: "M1 4v6h6M23 20v-6h-6" }), /* @__PURE__ */ React2.createElement("path", { d: "M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" }))
  )), /* @__PURE__ */ React2.createElement("p", { className: "text-sm text-gray-300" }, challenge.description)), /* @__PURE__ */ React2.createElement(
    "button",
    {
      onClick: handleStartCapture,
      className: "mt-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
    },
    "Start Challenge"
  )), stage === "capture" && /* @__PURE__ */ React2.createElement(
    CameraCapture_default,
    {
      onCapture: handleCaptureComplete,
      onCancel: () => setStage("display"),
      facingMode: (challenge == null ? void 0 : challenge.type) === "selfie" ? "user" : "environment"
    }
  ), stage === "verifying" && /* @__PURE__ */ React2.createElement("div", { className: "flex-1 flex flex-col items-center justify-center" }, /* @__PURE__ */ React2.createElement("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ React2.createElement("p", { className: "text-gray-300" }, "Verifying submission...")));
};
var ChallengeMode_default = ChallengeMode;

// src/components/LoginMode.tsx
import React3, { useState as useState3 } from "react";
var LoginMode = ({
  onSuccess,
  onFailed,
  apiEndpoint
}) => {
  const [stage, setStage] = useState3("login");
  const [nocenaId, setNocenaId] = useState3("");
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
  return /* @__PURE__ */ React3.createElement("div", { className: "flex-1 flex flex-col" }, stage === "login" && /* @__PURE__ */ React3.createElement("div", { className: "flex-1 flex flex-col" }, /* @__PURE__ */ React3.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-300 mb-4" }, "Login with your Nocena profile to verify you're human. You must have completed at least 3 challenges in the past month."), /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: "text",
      value: nocenaId,
      onChange: (e) => setNocenaId(e.target.value),
      placeholder: "Enter your Nocena ID",
      className: "w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
    }
  )), /* @__PURE__ */ React3.createElement(
    "button",
    {
      onClick: handleLogin,
      className: "mt-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
    },
    "Continue with Nocena"
  )), stage === "selfie" && /* @__PURE__ */ React3.createElement("div", { className: "flex-1 flex flex-col" }, /* @__PURE__ */ React3.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React3.createElement("h4", { className: "font-semibold mb-2" }, "Selfie Verification"), /* @__PURE__ */ React3.createElement("p", { className: "text-sm text-gray-300" }, "Take a selfie to verify your identity")), /* @__PURE__ */ React3.createElement(
    CameraCapture_default,
    {
      onCapture: handleSelfieCapture,
      onCancel: () => setStage("login"),
      facingMode: "user"
    }
  )), stage === "verifying" && /* @__PURE__ */ React3.createElement("div", { className: "flex-1 flex flex-col items-center justify-center" }, /* @__PURE__ */ React3.createElement("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ React3.createElement("p", { className: "text-gray-300" }, "Verifying your Nocena profile...")));
};
var LoginMode_default = LoginMode;

// src/components/VHPCaptcha.tsx
var VHPCaptcha = ({
  onVerified,
  onFailed,
  apiEndpoint = "/api/vhp/verify",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState4(false);
  const [mode, setMode] = useState4("initial");
  const [verificationToken, setVerificationToken] = useState4(null);
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
  return /* @__PURE__ */ React4.createElement(
    motion.div,
    {
      className: `relative bg-gray-900 text-white rounded-lg overflow-hidden ${className}`,
      animate: {
        width: isExpanded ? "400px" : "300px",
        height: isExpanded ? "500px" : "74px"
      },
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    mode === "initial" && /* @__PURE__ */ React4.createElement(
      "button",
      {
        onClick: handleClick,
        className: "w-full h-full flex items-center justify-between px-4 hover:bg-gray-800 transition-colors"
      },
      /* @__PURE__ */ React4.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React4.createElement("div", { className: "w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center" }, /* @__PURE__ */ React4.createElement(
        "svg",
        {
          className: "w-4 h-4",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2"
        },
        /* @__PURE__ */ React4.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })
      )), /* @__PURE__ */ React4.createElement("span", { className: "font-medium" }, "Verify you're human")),
      /* @__PURE__ */ React4.createElement("span", { className: "text-xs text-gray-400" }, "Powered by Nocena")
    ),
    /* @__PURE__ */ React4.createElement(AnimatePresence, null, isExpanded && /* @__PURE__ */ React4.createElement(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "p-4 h-full flex flex-col"
      },
      (mode === "challenge" || mode === "login") && /* @__PURE__ */ React4.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React4.createElement("h3", { className: "text-lg font-semibold" }, mode === "challenge" ? "Complete Challenge" : "Login with Nocena"), /* @__PURE__ */ React4.createElement(
        "button",
        {
          onClick: () => setMode(mode === "challenge" ? "login" : "challenge"),
          className: "text-sm text-blue-400 hover:text-blue-300"
        },
        mode === "challenge" ? "Login instead" : "Complete challenge"
      )),
      mode === "challenge" && /* @__PURE__ */ React4.createElement(
        ChallengeMode_default,
        {
          onSuccess: handleVerificationSuccess,
          onFailed: handleVerificationFailed,
          apiEndpoint
        }
      ),
      mode === "login" && /* @__PURE__ */ React4.createElement(
        LoginMode_default,
        {
          onSuccess: handleVerificationSuccess,
          onFailed: handleVerificationFailed,
          apiEndpoint
        }
      ),
      mode === "success" && /* @__PURE__ */ React4.createElement(
        motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          className: "flex-1 flex flex-col items-center justify-center text-center"
        },
        /* @__PURE__ */ React4.createElement("div", { className: "w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4" }, /* @__PURE__ */ React4.createElement("svg", { className: "w-8 h-8", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React4.createElement("path", { d: "M20 6L9 17l-5-5" }))),
        /* @__PURE__ */ React4.createElement("h3", { className: "text-xl font-semibold text-green-400" }, "Verified!"),
        /* @__PURE__ */ React4.createElement("p", { className: "text-sm text-gray-400 mt-2" }, "You're human. Token earned!")
      ),
      mode === "failed" && /* @__PURE__ */ React4.createElement(
        motion.div,
        {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          className: "flex-1 flex flex-col items-center justify-center text-center"
        },
        /* @__PURE__ */ React4.createElement("div", { className: "w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4" }, /* @__PURE__ */ React4.createElement("svg", { className: "w-8 h-8", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ React4.createElement("path", { d: "M18 6L6 18M6 6l12 12" }))),
        /* @__PURE__ */ React4.createElement("h3", { className: "text-xl font-semibold text-red-400" }, "Verification Failed"),
        /* @__PURE__ */ React4.createElement("p", { className: "text-sm text-gray-400 mt-2" }, "Please try again"),
        /* @__PURE__ */ React4.createElement(
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
export {
  VHPCaptcha_default as VHPCaptcha,
  initVHP
};
