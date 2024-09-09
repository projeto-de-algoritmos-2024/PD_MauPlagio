import { useState, useEffect } from "react";
import MyWorks from "./utils/works.json";

export default function App() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const works = MyWorks.results;
    let combinedText = "";
    works.forEach((work) => {
      combinedText += work.fullText + " "; // Adiciona um espaço para separar os textos
    });
    setText2(combinedText);
  }, []);

  function getAlignedSequences(seq1, seq2) {
    const match = 1;
    const mismatch = 0;
    const len1 = seq1.length;
    const len2 = seq2.length;

    const alignedSeq1 = [];
    const alignedSeq2 = [];

    // Matriz de pontuação para o alinhamento de sequência
    const dp = Array.from(Array(len1 + 1), () => Array(len2 + 1).fill(0));

    // Preencher a matriz de pontuação
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const score = seq1[i - 1] === seq2[j - 1] ? match : mismatch;
        dp[i][j] = Math.max(
          dp[i - 1][j - 1] + score,
          dp[i - 1][j],
          dp[i][j - 1]
        );
      }
    }

    // Rastrear o alinhamento
    let i = len1;
    let j = len2;
    while (i > 0 && j > 0) {
      if (seq1[i - 1] === seq2[j - 1]) {
        alignedSeq1.unshift({ char: seq1[i - 1], match: true });
        alignedSeq2.unshift({ char: seq2[j - 1], match: true });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        alignedSeq1.unshift({ char: seq1[i - 1], match: false });
        alignedSeq2.unshift({ char: "-", match: false });
        i--;
      } else {
        alignedSeq1.unshift({ char: "-", match: false });
        alignedSeq2.unshift({ char: seq2[j - 1], match: false });
        j--;
      }
    }

    // Adicionar os caracteres restantes
    while (i > 0) {
      alignedSeq1.unshift({ char: seq1[i - 1], match: false });
      alignedSeq2.unshift({ char: "-", match: false });
      i--;
    }
    while (j > 0) {
      alignedSeq1.unshift({ char: "-", match: false });
      alignedSeq2.unshift({ char: seq2[j - 1], match: false });
      j--;
    }

    return { alignedSeq1, alignedSeq2 };
  }

  const handleClick = () => {
    const { alignedSeq1, alignedSeq2 } = getAlignedSequences(text1, text2);
    setResult({ alignedSeq1, alignedSeq2 });
  };

  const renderAlignedText = (alignedText) => {
    return alignedText.map((item, index) => (
      <span key={index} style={{ color: item.match ? "green" : "red" }}>
        {item.char}
      </span>
    ));
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white p-20">
      <h1 className="text-4xl font-bold mb-10">MauPlagio</h1>
      <div className="flex gap-10 flex-col xl:flex-row">
        <textarea
          placeholder="Insira o primeiro texto..."
          className="p-4 xl:w-[400px] w-[350px] h-[300px] bg-slate-800 rounded-xl border-slate-500 border-2"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        />
      </div>
      <button
        className="bg-green-600 p-4 rounded-xl text-white mt-10 w-[300px]"
        onClick={handleClick}
      >
        Será que tem plágio 😎😎😎
      </button>
      {result && (
        <div className="mt-5 text-xl flex gap-10">
          <div>
            <h3>Texto Comparado</h3>
            <p>{renderAlignedText(result.alignedSeq2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
