'use client';

import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Department {
  base: string;
  allowNegative: boolean;
  units: Record<string, number>;
}

const departments: Record<string, Department> = {
  Length: {
    base: 'm',
    allowNegative: false,
    units: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  },
  Mass: {
    base: 'kg',
    allowNegative: false,
    units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
  },
  Time: {
    base: 's',
    allowNegative: false,
    units: { h: 3600, min: 60, s: 1, ms: 0.001 },
  },
  'Electric Current': {
    base: 'A',
    allowNegative: false,
    units: { A: 1, mA: 0.001, μA: 0.000001 },
  },
  Temperature: {
    base: 'K',
    allowNegative: true,
    units: { C: 1, K: 1, F: 1 },
  },
  'Amount of Substance': {
    base: 'mol',
    allowNegative: false,
    units: { mol: 1, mmol: 0.001 },
  },
  'Luminous Intensity': {
    base: 'cd',
    allowNegative: false,
    units: { cd: 1 },
  },
  Area: {
    base: 'm²',
    allowNegative: false,
    units: { 'km²': 1e6, 'm²': 1, 'cm²': 0.0001, 'mm²': 0.000001 },
  },
  Volume: {
    base: 'm³',
    allowNegative: false,
    units: { 'm³': 1, 'cm³': 0.000001, L: 0.001, mL: 0.000001 },
  },
  Speed: {
    base: 'm/s',
    allowNegative: false,
    units: { 'm/s': 1, 'km/h': 0.277778, 'mi/h': 0.44704 },
  },
  Acceleration: {
    base: 'm/s²',
    allowNegative: false,
    units: { 'm/s²': 1 },
  },
  Force: {
    base: 'N',
    allowNegative: false,
    units: { N: 1, kN: 1000, lbf: 4.44822 },
  },
  Pressure: {
    base: 'Pa',
    allowNegative: false,
    units: { Pa: 1, kPa: 1000, bar: 1e5, atm: 101325 },
  },
  Energy: {
    base: 'J',
    allowNegative: false,
    units: { J: 1, kJ: 1000, cal: 4.184 },
  },
  Power: {
    base: 'W',
    allowNegative: false,
    units: { W: 1, kW: 1000, hp: 745.7 },
  },
  Voltage: {
    base: 'V',
    allowNegative: false,
    units: { V: 1, mV: 0.001 },
  },
  Frequency: {
    base: 'Hz',
    allowNegative: false,
    units: { Hz: 1, kHz: 1000, MHz: 1e6 },
  },
};

export default function UnitConverter() {
  const [department, setDepartment] = useState('Length');
  const [inputUnit, setInputUnit] = useState('m');
  const [outputUnit, setOutputUnit] = useState('km');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [department]);

  const handleConvert = () => {
    const dept = departments[department];
    const value = parseFloat(inputValue);

    if (isNaN(value) || (!dept.allowNegative && value < 0)) {
      setResult('Invalid input.');
      setSteps([]);
      return;
    }

    let converted: number;
    let explanation: string[] = [];

    if (department === 'Temperature') {
      // Temperature special cases with explanation
      if (inputUnit === 'C' && outputUnit === 'K') {
        converted = value + 273.15;
        explanation = [
          `Convert Celsius to Kelvin: K = C + 273.15`,
          `${value}°C + 273.15 = ${converted.toFixed(2)} K`,
        ];
      } else if (inputUnit === 'K' && outputUnit === 'C') {
        converted = value - 273.15;
        explanation = [
          `Convert Kelvin to Celsius: C = K - 273.15`,
          `${value} K - 273.15 = ${converted.toFixed(2)}°C`,
        ];
      } else if (inputUnit === 'C' && outputUnit === 'F') {
        converted = value * 9 / 5 + 32;
        explanation = [
          `Convert Celsius to Fahrenheit: F = C × 9/5 + 32`,
          `${value}°C × 9/5 + 32 = ${converted.toFixed(2)}°F`,
        ];
      } else if (inputUnit === 'F' && outputUnit === 'C') {
        converted = (value - 32) * 5 / 9;
        explanation = [
          `Convert Fahrenheit to Celsius: C = (F - 32) × 5/9`,
          `(${value}°F - 32) × 5/9 = ${converted.toFixed(2)}°C`,
        ];
      } else if (inputUnit === 'F' && outputUnit === 'K') {
        converted = (value - 32) * 5 / 9 + 273.15;
        explanation = [
          `Convert Fahrenheit to Kelvin: K = (F - 32) × 5/9 + 273.15`,
          `(${value}°F - 32) × 5/9 + 273.15 = ${converted.toFixed(2)} K`,
        ];
      } else if (inputUnit === 'K' && outputUnit === 'F') {
        converted = (value - 273.15) * 9 / 5 + 32;
        explanation = [
          `Convert Kelvin to Fahrenheit: F = (K - 273.15) × 9/5 + 32`,
          `(${value} K - 273.15) × 9/5 + 32 = ${converted.toFixed(2)}°F`,
        ];
      } else {
        converted = value;
        explanation = [`No conversion needed, same units.`];
      }
    } else {
      const baseValue = value * dept.units[inputUnit];
      converted = baseValue / dept.units[outputUnit];
      explanation = [
        `1 ${inputUnit} = ${dept.units[inputUnit]} ${dept.base}`,
        `${value} ${inputUnit} = ${value} × ${dept.units[inputUnit]} = ${baseValue} ${dept.base}`,
        `1 ${outputUnit} = ${dept.units[outputUnit]} ${dept.base}`,
        `So, ${baseValue} ${dept.base} ÷ ${dept.units[outputUnit]} = ${converted} ${outputUnit}`,
      ];
    }

    setResult(`${converted.toFixed(4)} ${outputUnit}`);
    setSteps(explanation);
  };

  const handleReset = () => {
    setInputValue('');
    setResult('');
    setSteps([]);
  };

  // Update units when department changes
  React.useEffect(() => {
    const units = Object.keys(departments[department].units);
    setInputUnit(units[0]);
    setOutputUnit(units[1] || units[0]);
    setInputValue('');
    setResult('');
    setSteps([]);
  }, [department]);

  return (
    <main className={styles.container}>
      <Head>
        <title>Universal Unit Converter</title>
        <meta name="description" content="Convert units across 17 physical departments." />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          crossOrigin="anonymous"
        ></script>
      </Head>

      <h1>Universal Unit Converter</h1>

      <label>
        Department:
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          {Object.keys(departments).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </label>

      <label>
        From:
        <select value={inputUnit} onChange={(e) => setInputUnit(e.target.value)}>
          {Object.keys(departments[department].units).map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </label>

      <label>
        To:
        <select value={outputUnit} onChange={(e) => setOutputUnit(e.target.value)}>
          {Object.keys(departments[department].units).map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </label>

      <input
        type="number"
        placeholder="Enter value"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      <div className={styles.buttonGroup}>
        <button onClick={handleConvert}>Convert</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <div className={styles.result}>
        <h2>Result:</h2>
        <p>{result}</p>
      </div>

      <div className={styles.steps}>
        <h3>Steps:</h3>
        <ol>
          {steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Google AdSense Block */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', marginTop: '1.5rem' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </main>
  );
}
