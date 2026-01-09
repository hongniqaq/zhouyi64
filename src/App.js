import React, { useState } from 'react';
import { LucideCompass, RotateCcw, ScrollText, ArrowRight, Info } from 'lucide-react';
import guaDetailData from './guaData.json'; // 确保 json 文件在同级目录
import './App.css';

// --- 1. 二进制码与 JSON ID 的映射表 ---
// 按照《周易》64卦的标准二进制（从初爻到上爻，阳=1, 阴=0）
const GUA_MAP = {
  "111111": "1", "000000": "2", "010001": "3", "100010": "4", "010111": "5", "111010": "6", "010000": "7", "000010": "8",
  "110111": "9", "111011": "10", "111000": "11", "000111": "12", "101111": "13", "111101": "14", "000100": "15", "001000": "16",
  "100110": "17", "011001": "18", "110000": "19", "000011": "20", "100101": "21", "101001": "22", "000001": "23", "100000": "24",
  "100111": "25", "111001": "26", "100001": "27", "011110": "28", "010010": "29", "101101": "30", "011100": "31", "001110": "32",
  "001111": "33", "111100": "34", "000101": "35", "101000": "36", "101011": "37", "110101": "38", "010100": "39", "001010": "40",
  "110001": "41", "100011": "42", "111110": "43", "011111": "44", "000110": "45", "011000": "46", "011010": "47", "010110": "48",
  "101110": "49", "011101": "50", "100100": "51", "001001": "52", "001011": "53", "110100": "54", "001101": "55", "101100": "56",
  "011011": "57", "110110": "58", "010011": "59", "110010": "60", "110011": "61", "001100": "62", "101010": "63", "010101": "64"
};

const BAGUA_NAME = {
  "111": "乾（天）", "011": "兑（泽）", "101": "离（火）", "001": "震（雷）",
  "110": "巽（风）", "010": "坎（水）", "100": "艮（山）", "000": "坤（地）"
};

function App() {
  const [hexagram, setHexagram] = useState([]);
  const [currentCoins, setCurrentCoins] = useState([true, true, true]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeGua = (history) => {
    const bottomUp = [...history].reverse();

    const getBinArray = (yaoArr, isChanging = false) => {
      return yaoArr.map(s => {
        if (!isChanging) return (s === 7 || s === 9 ? "1" : "0");
        if (s === 6) return "1";
        if (s === 9) return "0";
        return (s === 7 ? "1" : "0");
      });
    };

    const benBin = getBinArray(bottomUp, false);
    const bianBin = getBinArray(bottomUp, true);
    const movingCount = history.filter(s => s === 6 || s === 9).length;

    const getGuaDetail = (binArr) => {
      const binStr = binArr.join("");
      const guaId = GUA_MAP[binStr];
      const detailedInfo = guaId ? guaDetailData[guaId] : null;

      return {
        id: guaId,
        name: detailedInfo ? detailedInfo.full_name : "未知卦",
        upperName: BAGUA_NAME[binArr.slice(3, 6).join("")],
        lowerName: BAGUA_NAME[binArr.slice(0, 3).join("")],
        details: detailedInfo
      };
    };

    setResult({
      ben: getGuaDetail(benBin),
      bian: movingCount > 0 ? getGuaDetail(bianBin) : null,
      movingCount
    });
  };

  const toss = () => {
    if (hexagram.length >= 6) return;
    setIsSpinning(true);
    setTimeout(() => {
      const flip = () => Math.random() > 0.5;
      const results = [flip(), flip(), flip()];
      const score = results.reduce((acc, curr) => acc + (curr ? 3 : 2), 0);
      setCurrentCoins(results);
      const newHexagram = [score, ...hexagram];
      setHexagram(newHexagram);
      setIsSpinning(false);
      if (newHexagram.length === 6) analyzeGua(newHexagram);
    }, 600);
  };

  const reset = () => {
    setHexagram([]);
    setResult(null);
  };

  const getYaoInfo = (score) => {
    if (score === 6) return { sym: "—\u00A0  — ✕", name: "老阴(变卦)", cls: "change" };
    if (score === 7) return { sym: "———", name: "少阳", cls: "static" };
    if (score === 8) return { sym: "—\u00A0  —", name: "少阴", cls: "static" };
    if (score === 9) return { sym: "——— ◯", name: "老阳(变卦)", cls: "change" };
    return { sym: "———", name: "", cls: "empty" };
  };

  return (
    <div className="divine-container">
      <div className="mystic-bg"></div>
      <nav className="navbar">
        <div className="logo"><LucideCompass className="icon-gold" /> 易经<span>赛博起卦</span></div>
        <div className="step-indicator">起卦进度: {hexagram.length} / 6</div>
      </nav>

      <main className="divine-grid">
        <section className="toss-section">
          <div className="coin-stage">
            {currentCoins.map((isHeads, i) => (
              <div key={i} className={`coin ${isSpinning ? 'spinning' : ''} ${isHeads ? 'heads' : 'tails'}`}>
                <div className="side front">{isHeads ? "正" : "反"}</div>
                <div className="side back">☯</div>
              </div>
            ))}
          </div>
          <div className="controls">
            <button className="divine-btn" onClick={toss} disabled={isSpinning || hexagram.length >= 6}>
              {hexagram.length >= 6 ? "起卦完成" : isSpinning ? "乾坤变幻中..." : "掷杯起爻"}
            </button>
            {hexagram.length > 0 && <button className="reset-btn" onClick={reset}><RotateCcw size={14} /> 重置</button>}
          </div>
        </section>

        <section className="hexagram-display">
          <div className="gua-container">
            {hexagram.map((score, index) => {
              const yao = getYaoInfo(score);
              return (
                <div key={index} className={`yao-row ${yao.cls}`}>
                  <span className="yao-symbol">{yao.sym}</span>
                  <span className="yao-name">{yao.name}</span>
                </div>
              );
            })}
          </div>

          {result && (
            <div className="result-scroll">
              <GuaCard title="本卦" data={result.ben} />
              {result.bian && <GuaCard title="变卦" data={result.bian} isChange />}
              <div className="footer-tip">
                <Info size={14} /> {result.movingCount > 0 ? `有 ${result.movingCount} 处变爻，未来趋势有变。` : "静爻无变，参考本卦。"}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// 抽离的卦象卡片组件
function GuaCard({ title, data, isChange }) {
  if (!data.details) return null;
  return (
    <div className={`result-card ${isChange ? 'change' : ''}`}>
      <div className="result-header">
        {isChange ? <ArrowRight className="icon-gold" size={18} /> : <ScrollText className="icon-gold" size={18} />}
        <span>{title}：{data.name}</span>
        <span className="level-tag">{data.details.level}</span>
      </div>
      <div className="gua-meta">{data.upperName}上 / {data.lowerName}下</div>
      <p className="xiang-yue">“ {data.details.xiang_yue} ”</p>
      <div className="detailed-analysis">
        {Object.entries(data.details.analysis).map(([key, value]) => (
          <div key={key} className="analysis-item">
            <label>{key}：</label>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;