import { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

function MoleculeViewer({ smiles }) {

  const canvasRef = useRef(null);

  useEffect(() => {

    if (!smiles) return;

    const drawer = new SmilesDrawer.Drawer({
      width: 500,
      height: 400
    });

    SmilesDrawer.parse(
      smiles,
      (tree) => {
        drawer.draw(
          tree,
          canvasRef.current,
          "light",
          false
        );
      },
      (err) => {
        console.error(err);
      }
    );

  }, [smiles]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={400}
    />
  );
}

export default MoleculeViewer;