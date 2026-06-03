import { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

function MoleculeViewer({ smiles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!smiles || !canvasRef.current) return;

    const drawer = new SmilesDrawer.Drawer({
      width: 500,
      height: 360,
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

    SmilesDrawer.parse(
      smiles,
      (tree) => {
        drawer.draw(tree, canvasRef.current, "light", false);
      },
      (err) => {
        console.error("SmilesDrawer error:", err);
      }
    );
  }, [smiles]);

  return <canvas ref={canvasRef} width={500} height={360} />;
}

export default MoleculeViewer;