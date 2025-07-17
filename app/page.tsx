"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Define interfaces for type safety
interface Department {
  base?: string;
  allowNegative: boolean;
  units: Record<string, number> | readonly string[];
}

// Explicitly define DepartmentKey to avoid circular reference
type DepartmentKey =
  | "Length"
  | "Mass"
  | "Time"
  | "Temperature"
  | "ElectricCurrent"
  | "AmountOfSubstance"
  | "LuminousIntensity"
  | "Area"
  | "Volume"
  | "Pressure"
  | "Speed"
  | "Acceleration"
  | "Force"
  | "Energy"
  | "Power"
  | "Frequency"
  | "Density";

interface Conversion {
  input: number;
  from: string;
  to: string;
  result: string;
  department: DepartmentKey;
}

/***************************************
 * Departments (17)
 ***************************************/
const departments: Record<DepartmentKey, Department> = {
  Length: { base: "m", allowNegative: false, units: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 } },
  Mass: { base: "kg", allowNegative: false, units: { t: 1000, kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, oz: 0.0283495 } },
  Time: { base: "s", allowNegative: false, units: { yr: 31536000, wk: 604800, day: 86400, hr: 3600, min: 60, s: 1 } },
  Temperature: { allowNegative: true, units: ["C", "F", "K"] as const },
  ElectricCurrent: { base: "A", allowNegative: true, units: { kA: 1e3, A: 1, mA: 1e-3, μA: 1e-6 } },
  AmountOfSubstance: { base: "mol", allowNegative: false, units: { mol: 1, mmol: 1e-3 } },
  LuminousIntensity: { base: "cd", allowNegative: false, units: { cd: 1 } },
  Area: { base: "m²", allowNegative: false, units: { "km²": 1e6, "m²": 1, "cm²": 1e-4, "mm²": 1e-6, acre: 4046.86, "ft²": 0.092903 } },
  Volume: { base: "m³", allowNegative: false, units: { m3: 1, L: 1e-3, mL: 1e-6, "ft³": 0.0283168, "in³": 1.63871e-5 } },
  Pressure: { base: "Pa", allowNegative: false, units: { Pa: 1, kPa: 1e3, bar: 1e5, atm: 101325, psi: 6894.76 } },
  Speed: { base: "m/s", allowNegative: false, units: { "m/s": 1, kmh: 0.277778, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 } },
  Acceleration: { base: "m/s²", allowNegative: false, units: { "m/s²": 1, "ft/s²": 0.3048, g: 9.80665 } },
  Force: { base: "N", allowNegative: false, units: { N: 1, kN: 1e3, dyn: 1e-5, lbf: 4.44822 } },
  Energy: { base: "J", allowNegative: false, units: { J: 1, kJ: 1e3, cal: 4.184, Wh: 3600, eV: 1.60218e-19 } },
  Power: { base: "W", allowNegative: false, units: { W: 1, kW: 1e3, MW: 1e6, hp: 745.7 } },
  Frequency: { base: "Hz", allowNegative: false, units: { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, rpm: 1/60 } },
  Density: { base: "kg/m³", allowNegative: false, units: { "kg/m³": 1, "g/cm³": 1e3, "lb/ft³": 16.0185 } },
};

/***************************************
 * Helpers
 ***************************************/
const numberRe = /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i;

const numbers = [1, 2, 3, 4];

numbers.map((v: number) => {
  return v * 2;
});

// Type guard to check if units is an array
const isUnitArray = (units: Department['units']): units is readonly string[] => {
  return Array.isArray(units);
};

const toBase = (v: number, u: string, dep: { units: Record<string, number> }) => v * dep.units[u];
const fromBase = (v: number, u: string, dep: { units: Record<string, number> }) => v / dep.units[u];
const convertTemp = (v: number, f: string, t: string) => {
  let C = f === "C" ? v : f === "F" ? (v - 32) * 5/9 : v - 273.15;
  return t === "C" ? C : t === "F" ? C * 9/5 + 32 : C + 273.15;
};

export default function Page() {
  const [dept, setDept] = useState<DepartmentKey>("Length");
  const initUnits = isUnitArray(departments.Length.units) ? [...departments.Length.units] : Object.keys(departments.Length.units);
  const [from, setFrom] = useState<string>(initUnits[0]);
  const [to, setTo] = useState<string>(initUnits[1] || initUnits[0]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [stepTxt, setStepTxt] = useState("");
  const [err, setErr] = useState("");
  const [history, setHistory] = useState<Conversion[]>([]);

  // Fix: Use type guard to safely handle units union type
  const unitKeys = isUnitArray(departments[dept].units)
    ? [...departments[dept].units]
    : Object.keys(departments[dept].units);

  const resetUnits = (d: DepartmentKey) => {
    const keys = isUnitArray(departments[d].units)
      ? [...departments[d].units]
      : Object.keys(departments[d].units);
    setFrom(keys[0]);
    setTo(keys[1] || keys[0]);
  };

  const handleConvert = () => {
    if (from === to) {
      setErr("❌ 'From' and 'To' units must be different.");
      setResult(null);
      setStepTxt("");
      return;
    }
    if (!numberRe.test(input.trim())) {
      setErr("❌ Enter a valid number – letters are not allowed.");
      setResult(null);
      setStepTxt("");
      return;
    }
    const num = parseFloat(input);
    if (!departments[dept].allowNegative && num < 0) {
      setErr(`❌ Negative values are not valid for ${dept}.`);
      setResult(null);
      setStepTxt("");
      return;
    }
    setErr("");

    let resultStr: string;
    let steps: string;

    if (dept === "Temperature") {
      const res = convertTemp(num, from, to);
      resultStr = `${res.toFixed(4)} ${to}`;
      steps = `**Step 1**: Convert **${num} ${from}** to Celsius.\n**Step 2**: Convert Celsius to **${to}**.`;
    } else {
      const dep = departments[dept];
      const baseVal = toBase(num, from, dep as { units: Record<string, number> });
      const finalVal = fromBase(baseVal, to, dep as { units: Record<string, number> });
      resultStr = `${finalVal.toFixed(6)} ${to}`;
      steps = `**Step 1**: 1 ${from} = ${(dep.units as Record<string, number>)[from]} ${dep.base}.\n` +
        `**Step 2**: **${num} ${from}** = ${num} × ${(dep.units as Record<string, number>)[from]} = ${baseVal} ${dep.base}.\n` +
        `**Step 3**: 1 ${to} = ${(dep.units as Record<string, number>)[to]} ${dep.base}.\n` +
        `**Step 4**: ${baseVal} ÷ ${(dep.units as Record<string, number>)[to]} = **${finalVal} ${to}**`;
    }

    setResult(resultStr);
    setStepTxt(steps);
    setHistory([...history, { input: num, from, to, result: resultStr, department: dept }]);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🌐 Universal Converter</h1>

      <label className={styles.label}>Department</label>
      <select
        className={styles.select}
        value={dept}
        onChange={(e) => {
          setDept(e.target.value as DepartmentKey);
          resetUnits(e.target.value as DepartmentKey);
          setInput("");
          setResult(null);
          setStepTxt("");
          setErr("");
        }}
      >
        {Object.keys(departments).map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      <label className={styles.label}>Enter value</label>
      <input className={styles.input} value={input} onChange={(e) => setInput(e.target.value)} />

      <label className={styles.label}>From Unit</label>
      <select className={styles.select} value={from} onChange={(e) => setFrom(e.target.value)}>
        {unitKeys.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>

      <label className={styles.label}>To Unit</label>
      <select className={styles.select} value={to} onChange={(e) => setTo(e.target.value)}>
        {unitKeys.map((u) => (
          <option key={u}>{u}</option>
        ))}
      </select>

      <button className={styles.button} onClick={handleConvert}>
        Convert
      </button>

      <button
        className={styles.button}
        onClick={() => {
          setDept("Length");
          resetUnits("Length");
          setInput("");
          setResult(null);
          setStepTxt("");
          setErr("");
          setHistory([]);
        }}
      >
        Reset
      </button>

      {err && <p className={styles.error}>{err}</p>}
      {result && (
        <p className={styles.result}>
          Result: <strong>{result}</strong>
        </p>
      )}
      {stepTxt && (
        <div className={styles.steps} dangerouslySetInnerHTML={{ __html: stepTxt.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }} />
      )}

      {history.length > 0 && (
        <div className={styles.history}>
          <h2 className={styles.historyTitle}>Conversion History</h2>
          <ul>
            {history.map((conv, index) => (
              <li key={index}>
                {conv.department}: {conv.input} {conv.from} → {conv.result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}