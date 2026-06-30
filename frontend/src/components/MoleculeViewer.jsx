import { useEffect, useRef, useState } from "react";
import SmilesDrawer from "smiles-drawer";

function MoleculeViewer({ smiles, width = 500, height = 360, mini = false }) {
  const canvasRef = useRef(null);
  const [drawError, setDrawError] = useState(false);

  useEffect(() => {
    setDrawError(false);

    if (!smiles || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawer = new SmilesDrawer.Drawer({
      width,
      height,
      bondThickness: mini ? 1 : 2,
      themes: {
        light: {
          C: "#1a1a1a",
          O: "#c0392b",
          N: "#2475b0",
          F: "#27ae60",
          CL: "#16a085",
          BR: "#8e44ad",
          I: "#7f8c8d",
          P: "#e67e22",
          S: "#d4ac0d",
          H: "#95a5a6",
        },
      },
    });

    try {
      SmilesDrawer.parse(
        smiles,
        (tree) => {
          try {
            drawer.draw(tree, canvas, "light", false);
          } catch (drawErr) {
            console.error("SmilesDrawer draw error:", drawErr);
            setDrawError(true);
          }
        },
        (parseErr) => {
          console.error("SmilesDrawer parse error:", parseErr, "for SMILES:", smiles);
          setDrawError(true);
        }
      );
    } catch (e) {
      console.error("SmilesDrawer unexpected error:", e);
      setDrawError(true);
    }
  }, [smiles, width, height, mini]);

  if (drawError) {
    if (mini) {
      return <div className="mv-mini-error" aria-hidden="true">⚠</div>;
    }
    return (
      <div className="mv-error">
        <span className="mv-error-icon" aria-hidden="true">⚠</span>
        <p>Could not render this structure.</p>
        <p className="mv-error-sub">The SMILES string may be chemically invalid.</p>
      </div>
    );
  }

  return <canvas ref={canvasRef} width={width} height={height} />;
}

export default MoleculeViewer;