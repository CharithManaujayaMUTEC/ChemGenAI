import { useState } from "react";
import axios from "axios";

function App() {

  const [molecule, setMolecule] = useState("");

  const generateMolecule = async () => {

    try {

      const response = await axios.post(
        "https://charithmanujaya1-chemgenai.hf.space/generate",
        {
          prompt: "Generate a molecule"
        }
      );

      setMolecule(
        response.data.generated_smiles
      );

    } catch (error) {

      console.error(error);

    }

  };

  return (
    <div>
      <h1>ChemGenAI</h1>

      <button onClick={generateMolecule}>
        Generate Molecule
      </button>

      <h3>{molecule}</h3>
    </div>
  );
}

export default App;