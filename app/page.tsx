'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Department {
  base?: string;
  allowNegative: boolean;
  units: Record<string, number> | readonly string[];
}

const departments: Record<string, Department> = {
  Length: { base: "m", allowNegative: false, units: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 } },
  Mass: { base: "kg", allowNegative: false, units: { t: 1000, kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, oz: 0.0283495 } },
  Time: { base: "s", allowNegative: false, units: { yr: 31536000, wk: 604800, day: 86400, hr: 3600, min: 60, s: 1 } },
  Temperature: { allowNegative: true, units: ["C", "F", "K"] },
  ElectricCurrent: { base: "A", allowNegative: true, units: { kA: 1000, A: 1, mA: 0.001, μA: 0.000001 } },
  AmountOfSubstance: { base: "mol", allowNegative: false, units: { mol: 1, mmol: 0.001 } },
  LuminousIntensity: { base: "cd", allowNegative: false, units: { cd: 1 } },
  Area: { base: "m²", allowNegative: false, units: { "km²": 1e6, "m²": 1, "cm²": 1e-4, "mm²": 1e-6, acre: 4046.86, "ft²": 0.092903 } },
  Volume: { base: "m³", allowNegative: false, units: { m3: 1, L: 0.001, mL: 0.000001, "ft³": 0.0283168, "in³": 1.63871e-5 } },
  Pressure: { base: "Pa", allowNegative: false, units: { Pa: 1, kPa: 1000, bar: 1e5, atm: 101325, psi: 6894.76 } },
  Speed: { base: "m/s", allowNegative: false, units: { "m/s": 1, kmh: 0.277778, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 } },
  Acceleration: { base: "m/s²", allowNegative: false, units: { "m/s²": 1, "ft/s²": 0.3048, g: 9.80665 } },
  Force: { base: "N", allowNegative: false, units: { N: 1, kN: 1000, dyn: 1e-5, lbf: 4.44822 } },
  Energy: { base: "J", allowNegative: false, units: { J: 1, kJ: 1000, cal: 4.184, Wh: 3600, eV: 1.60218e-19 } },
  Power: { base: "W", allowNegative: false, units: { W: 1, kW: 1000, MW: 1e6, hp: 745.7 } },
  Frequency: { base: "Hz", allowNegative: false, units: { Hz: 1, kHz: 1000, MHz: 1e6, GHz: 1e9, rpm: 1/60 } },
  Density: { base: "kg/m³", allowNegative: false, units: { "kg/m³": 1, "g/cm³": 1000, "lb/ft³": 16.0185 } },
};

// Properly typed function
const isUnitArray = (units: Record<string, number> | readonly string[]): units is readonly string[] => {
  return Array.isArray(units);
};

const toBase = (value: number, unit: string, dep: Department) => {
  if (isUnitArray(dep.units)) throw new Error("Cannot convert to base for array units");
  return value * dep.units[unit];
};

const fromBase = (value: number, unit: string, dep: Department) => {
  if (isUnitArray(dep.units)) throw new Error("Cannot convert from base for array units");
  return value / dep.units[unit];
};

const convertTemp = (v: number, from: string, to: string): number => {
  let C: number;
  if (from === "C") C = v;
  else if (from === "F") C = (v - 32) * 5 / 9;
  else C = v - 273.15;

  if (to === "C") return C;
  else if (to === "F") return C * 9 / 5 + 32;
  else return C + 273.15;
};

export default function Home() {
  const departmentKeys = Object.keys(departments);

  const [dept, setDept] = useState<string>("Length");
  const [input, setInput] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [stepTxt, setStepTxt] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    // Reset units when department changes
    const units = departments[dept].units;
    if (isUnitArray(units)) {
      setFromUnit(units[0]);
      setToUnit(units[1] || units[0]);
    } else {
      const keys = Object.keys(units);
      setFromUnit(keys[0]);
      setToUnit(keys[1] || keys[0]);
    }
    setInput("");
    setResult(null);
    setStepTxt("");
    setErr("");
  }, [dept]);

  const handleConvert = () => {
    setErr("");
    setResult(null);
    setStepTxt("");

    if (fromUnit === toUnit) {
      setErr("❌ 'From' and 'To' units must be different.");
      return;
    }

    const num = parseFloat(input.trim());
    if (isNaN(num)) {
      setErr("❌ Please enter a valid number.");
      return;
    }

    if (!departments[dept].allowNegative && num < 0) {
      setErr(`❌ Negative values are not allowed for ${dept}.`);
      return;
    }

    let resStr: string, steps: string;
    if (dept === "Temperature") {
      const conv = convertTemp(num, fromUnit, toUnit);
      resStr = `${conv.toFixed(4)} ${toUnit}`;
      steps = `Step 1: Convert ${num} ${fromUnit} to Celsius.\nStep 2: Convert Celsius to ${toUnit}.`;
    } else {
      const dep = departments[dept];
      const baseVal = toBase(num, fromUnit, dep);
      const finalVal = fromBase(baseVal, toUnit, dep);
      resStr = `${finalVal.toFixed(6)} ${toUnit}`;
      steps = `Step 1: 1 ${fromUnit} = ${dep.units[fromUnit]} ${dep.base}.\n` +
              `Step 2: ${num} ${fromUnit} = ${num} × ${dep.units[fromUnit]} = ${baseVal} ${dep.base}.\n` +
              `Step 3: 1 ${toUnit} = ${dep.units[toUnit]} ${dep.base}.\n` +
              `Step 4: ${baseVal} ÷ ${dep.units[toUnit]} = ${finalVal} ${toUnit}`;
    }

    setResult(resStr);
    setStepTxt(steps);
  };

  const unitKeys = isUnitArray(departments[dept].units)
    ? departments[dept].units
    : Object.keys(departments[dept].units);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🌐 Universal Converter</h1>

      <div className={styles.formColumn}>
        <label className={styles.label}>Department</label>
        <select
          className={styles.select}
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          {departmentKeys.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label className={styles.label}>From Unit</label>
        <select
          className={styles.select}
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
        >
          {unitKeys.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <label className={styles.label}>To Unit</label>
        <select
          className={styles.select}
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
        >
          {unitKeys.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <label className={styles.label}>Enter Value</label>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a number"
        />

        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleConvert}>
            Convert
          </button>
        </div>

        {err && <div className={styles.error}>{err}</div>}

        {result && (
          <div className={styles.result}>
            Result: <strong>{result}</strong>
          </div>
        )}

        {stepTxt && <pre className={styles.steps}>{stepTxt}</pre>}
      </div>
    </div>
  );
}
