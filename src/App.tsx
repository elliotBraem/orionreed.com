import { Canvas } from "@/components/Canvas";
import { Contact } from "@/components/Contact";
import { Toggle } from "@/components/Toggle";
import "@/css/style.css";
import { useCanvas } from "@/hooks/useCanvas";
import { createShapes } from "@/utils";
import "@tldraw/tldraw/tldraw.css";
import { inject } from "@vercel/analytics";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
inject();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/card/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

function Home() {
  const { isCanvasEnabled, elementsInfo } = useCanvas();
  const shapes = createShapes(elementsInfo);
  const [isEditorMounted, setIsEditorMounted] = useState(false);

  useEffect(() => {
    const handleEditorDidMount = () => {
      setIsEditorMounted(true);
    };

    window.addEventListener("editorDidMountEvent", handleEditorDidMount);

    return () => {
      window.removeEventListener("editorDidMountEvent", handleEditorDidMount);
    };
  }, []);

  return (
    <>
      <Toggle />
      <div
        style={{ zIndex: 999999 }}
        className={`${isCanvasEnabled && isEditorMounted ? "transparent" : ""}`}
      >
				{/* // I want to pass in a custom RPC */}
        <near-social-viewer src="efiz.near/widget/Tree"></near-social-viewer>
      </div>
      {isCanvasEnabled && elementsInfo.length > 0 ? (
        <Canvas shapes={shapes} />
      ) : null}
    </>
  );
}
