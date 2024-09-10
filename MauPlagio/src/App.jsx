import { useState, useEffect } from 'react';
import MyWorks from './utils/works.json';

export default function App() {
  const [textInput, setTextInput] = useState('');
  const [databaseTexts, setDatabaseTexts] = useState([]);
  const [result, setResult] = useState(null);
  const [isPlagiarism, setIsPlagiarism] = useState(false);
  const [alignedPlagiarizedText, setAlignedPlagiarizedText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDatabaseTexts(MyWorks.results.map((work) => work.fullText));
  }, []);

  const alinhaSequencias = (seq1, seq2) => {
    const m = seq1.length;
    const n = seq2.length;
    const gapPenalty = -1;
    const matchReward = 1;
    const mismatchPenalty = -1;

    const dp = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i * gapPenalty;
    for (let j = 0; j <= n; j++) dp[0][j] = j * gapPenalty;

    // Preenche a matriz dp com base nas correspondências, mismatches e gaps
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const match =
          dp[i - 1][j - 1] +
          (seq1[i - 1] === seq2[j - 1] ? matchReward : mismatchPenalty);
        const deleteGap = dp[i - 1][j] + gapPenalty;
        const insertGap = dp[i][j - 1] + gapPenalty;
        dp[i][j] = Math.max(match, deleteGap, insertGap); // Escolhe o melhor caminho
      }
    }

    // Fase de "traceback" para reconstruir o alinhamento baseado na tabela dp
    const alignedSeq1 = [];
    const alignedSeq2 = [];
    let i = m;
    let j = n;

    // Volta pelas células da matriz dp para encontrar o melhor alinhamento
    while (i > 0 || j > 0) {
      if (
        i > 0 &&
        j > 0 &&
        dp[i][j] ===
          dp[i - 1][j - 1] +
            (seq1[i - 1] === seq2[j - 1] ? matchReward : mismatchPenalty)
      ) {
        // Match ou mismatch, adicionar caracteres das duas sequências
        alignedSeq1.push({
          char: seq1[i - 1],
          match: seq1[i - 1] === seq2[j - 1],
        });
        alignedSeq2.push({
          char: seq2[j - 1],
          match: seq1[i - 1] === seq2[j - 1],
        });
        i--;
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + gapPenalty) {
        // Gap na segunda sequência
        alignedSeq1.push({ char: seq1[i - 1], match: false });
        alignedSeq2.push({ char: '-', match: false });
        i--;
      } else {
        // Gap na primeira sequência
        alignedSeq1.push({ char: '-', match: false });
        alignedSeq2.push({ char: seq2[j - 1], match: false });
        j--;
      }
    }

    // Inverte as sequências alinhadas, pois foram construídas de trás para frente
    alignedSeq1.reverse();
    alignedSeq2.reverse();

    // Retorna as sequências alinhadas
    return { alignedSeq1, alignedSeq2 };
  };

  const handleClick = () => {
    if (!textInput.trim()) return;

    setIsLoading(true);

    setTimeout(() => {
      let bestMatch = null;
      let bestScore = Number.NEGATIVE_INFINITY;
      let plagiarismDetected = false;
      let bestAlignedPlagiarizedText = null;

      for (const dbText of databaseTexts) {
        const alignment = alinhaSequencias(textInput, dbText);
        const matches = alignment.alignedSeq1.filter(
          (item) => item.match
        ).length;

        const maxLength = Math.max(textInput.length, dbText.length);
        const similarityPercentage = (matches / maxLength) * 100;

        if (matches > bestScore) {
          bestScore = matches;
          bestMatch = alignment;
        }

        if (similarityPercentage >= 50) {
          plagiarismDetected = true;
          bestAlignedPlagiarizedText = alignment.alignedSeq2;
        }
      }

      setIsPlagiarism(plagiarismDetected);
      setResult(bestMatch);

      if (plagiarismDetected) {
        setAlignedPlagiarizedText(bestAlignedPlagiarizedText);
      }

      setIsLoading(false);
    }, 100);
  };

  const renderAlignedText = (alignedText) => {
    return alignedText.map((item, index) => (
      <span key={index} style={{ color: item.match ? 'green' : 'red' }}>
        {item.char}
      </span>
    ));
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white p-20">
      <h1 className="text-4xl font-bold mb-10">MauPlagio</h1>
      <div className="flex gap-10 flex-col xl:flex-row">
        <textarea
          placeholder="Insira o texto a ser comparado..."
          className="p-4 xl:w-[400px] w-[350px] h-[300px] bg-slate-800 rounded-xl border-slate-500 border-2"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>
      <button
        className="bg-green-600 p-4 rounded-xl text-white mt-10 w-[300px]"
        onClick={handleClick}
        type="button"
      >
        Será que tem plágio 😎😎😎
      </button>
      {isLoading && (
        <div className="mt-5 text-xl text-gray-500">
          <p>Processando... Aguarde um momento.</p>
        </div>
      )}
      {isPlagiarism && alignedPlagiarizedText && (
        <div className="mt-5 text-xl text-red-500">
          <p>Plágio detectado! 🔥</p>
          <h3 className="mt-4">Texto Plagiado:</h3>
          <p className="bg-slate-800 p-4 rounded-xl">
            {renderAlignedText(alignedPlagiarizedText)}
          </p>
        </div>
      )}

      {!isPlagiarism && result && (
        <div className="mt-5 text-xl text-green-500">
          <p>Texto original, sem plágio detectado. ✅</p>
        </div>
      )}
    </div>
  );
}
