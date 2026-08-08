import { useState, useEffect } from "react";
import Button from "./componets/Button";
import Card from "./componets/Card";

function App() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  function addLog(message: string) {
    setLogs((prevLogs) => [...prevLogs, message]);
  }

  useEffect(() => {
    addLog("App loaded for the first time!");
  }, []); // empty array = run once, when the component first appears

  useEffect(() => {
    addLog("Count changed to: " + count);
  }, [count]); // runs every time 'count' changes

  return (
    <div>
      <h1>Medical Reasoning Platform</h1>
      <Button label={"Count: " + count} onClick={() => setCount(count + 1)} />
      <Card title="LDL" description="Carries cholesterol from liver to tissues." />
      <Card title="HDL" description="Carries cholesterol away from tissues to the liver." />

      <h3>Logs:</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;