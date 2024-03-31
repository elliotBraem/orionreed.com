import { useState, useEffect } from 'react';

interface ElementInfo {
  tagName: string;
  x: number;
  y: number;
  w: number;
  h: number;
  html: string;
}

export function useCanvas() {
  const [isCanvasEnabled, setIsCanvasEnabled] = useState(false);
  const [elementsInfo, setElementsInfo] = useState<ElementInfo[]>([]);

  useEffect(() => {
    const toggleCanvas = async () => {
      if (!isCanvasEnabled) {
        const info = await gatherElementsInfo();
        setElementsInfo(info);
        setIsCanvasEnabled(true);
        document.body.classList.add('canvas-mode');
      } else {
        setElementsInfo([]);
        setIsCanvasEnabled(false);
        document.body.classList.remove('canvas-mode');
      }
    };

    window.addEventListener('toggleCanvasEvent', toggleCanvas);

    return () => {
      window.removeEventListener('toggleCanvasEvent', toggleCanvas);
    };
  }, [isCanvasEnabled]);

  return { isCanvasEnabled, elementsInfo };
}

async function gatherElementsInfo() {
  const rootElement = document.getElementsByTagName('near-social-viewer')[0];
  const info: any[] = [];

  async function traverse(element: any) {
    const children = element.children;
    if (children.length === 0) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      let w = rect.width;
      let h = rect.height;
      if (!['P', 'UL', 'OL', 'IMG'].includes(element.tagName)) {
        w = measureElementTextWidth(element);
      }
      if (element.tagName === 'IMG') {
        // Check if the image has explicit width and height styles
        const parentComputedStyle = window.getComputedStyle(element.parentElement!);
        const parentWidth = parseFloat(parentComputedStyle.width);
        const parentHeight = parseFloat(parentComputedStyle.height);
        if (!isNaN(parentWidth) && !isNaN(parentHeight)) {
          w = parentWidth;
          h = parentHeight;
        }
      } else if (element.tagName === 'SPAN') {
        // Check if span is displayed as block or inline-block
        if (computedStyle.display === 'block' || computedStyle.display === 'inline-block') {
          w = rect.width;
          h = rect.height;
        }
      } else if (element.tagName === 'DIV') {
        // Check if the div has explicit width and height styles
        const width = parseFloat(computedStyle.width);
        const height = parseFloat(computedStyle.height);
        if (!isNaN(width) && !isNaN(height)) {
          w = width;
          h = height;
        }
      }
      let x = rect.left; // Default x position

      // Check if the element is centered
      if (computedStyle.display === 'block' && computedStyle.textAlign === 'center') {
        // Adjust x position for centered elements
        const parentWidth = element.parentElement ? element.parentElement.getBoundingClientRect().width : 0;
        x = (parentWidth - w) / 2 + window.scrollX + (element.parentElement ? element.parentElement.getBoundingClientRect().left : 0);
      }

      info.push({
        tagName: element.tagName,
        x: x,
        y: rect.top,
        w: w,
        h: h,
        html: element.outerHTML
      });
    } else {
      for (const child of children) {
        await traverse(child);
      }
    }
  }

  await traverse(rootElement);

  return info;
}

function measureElementTextWidth(element: HTMLElement) {
  // Create a temporary span element
  const tempElement = document.createElement('span');
  // Get the text content from the passed element
  tempElement.textContent = element.textContent || element.innerText;
  // Get the computed style of the passed element
  const computedStyle = window.getComputedStyle(element);
  // Apply relevant styles to the temporary element
  tempElement.style.font = computedStyle.font;
  tempElement.style.fontWeight = computedStyle.fontWeight;
  tempElement.style.fontSize = computedStyle.fontSize;
  tempElement.style.fontFamily = computedStyle.fontFamily;
  tempElement.style.letterSpacing = computedStyle.letterSpacing;
  // Ensure the temporary element is not visible in the viewport
  tempElement.style.position = 'absolute';
  tempElement.style.visibility = 'hidden';
  tempElement.style.whiteSpace = 'nowrap'; // Prevent text from wrapping
  // Append to the body to make measurements possible
  document.body.appendChild(tempElement);
  // Measure the width
  const width = tempElement.getBoundingClientRect().width;
  // Remove the temporary element from the document
  document.body.removeChild(tempElement);
  // Return the measured width
  return width === 0 ? 10 : width;
}