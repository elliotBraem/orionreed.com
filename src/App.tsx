import { Canvas } from "@/components/Canvas";
import { Contact } from "@/components/Contact";
import { Toggle } from "@/components/Toggle";
import "@/css/style.css";
import { useCanvas } from "@/hooks/useCanvas";
import { createShapes } from "@/utils";
import "@tldraw/tldraw/tldraw.css";
import { inject } from "@vercel/analytics";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
inject();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/card/contact" element={<Contact />} />
          {/* widget src will come from path */}
          <Route path="*" element={<Home />} /> 
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

function Home() {
  const { isCanvasEnabled, elementsInfo } = useCanvas();
  const shapes = createShapes(elementsInfo);
  const [isEditorMounted, setIsEditorMounted] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // create props from params
  const passProps = useMemo(() => {
    return Array.from(searchParams.entries()).reduce(
      (props: { [key: string]: string }, [key, value]) => {
        props[key] = value;
        return props;
      },
      {}
    );
  }, [location]);

  const path = location.pathname.substring(1);

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
        <near-social-viewer
          src={path || "efiz.near/widget/Default"} // components/Default deployed as widget
          initialProps={JSON.stringify(passProps)}
        />
      </div>
      {isCanvasEnabled && elementsInfo.length > 0 ? (
        <Canvas shapes={shapes} />
      ) : null}
    </>
  );
}
