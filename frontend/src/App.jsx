import { useState } from "react";
import axios from "axios";
import MoleculeViewer from "./components/MoleculeViewer";

function App() {

  const [smiles, setSmiles] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateMolecule = async () => {

    try {

      setLoading(true);

      const response = await axios.post(
        "https://charithmanujaya1-chemgenai.hf.space/generate",
        {
          prompt: "Generate a molecule"
        }
      );

      setSmiles(
        response.data.generated_smiles
      );

      setValid(
        response.data.valid
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div style={{ textAlign: "center" }}>

      <h1>ChemGenAI</h1>

      <button
        onClick={generateMolecule}
      >
        Generate Molecule
      </button>

      {loading && (
        <p>Generating...</p>
      )}

      {smiles && (
        <>
          <h3>Generated SMILES</h3>

          <p>{smiles}</p>

          <p>
            {valid
              ? "✅ Valid Molecule"
              : "❌ Invalid Molecule"}
          </p>

          <MoleculeViewer
            smiles={smiles}
          />
        </>
      )}

    </div>
  );
}

export default App;