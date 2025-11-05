import React from "react";
import { Button } from "./components/ui/button";

const App = () => {
  return (
    <>
      <div>Hello, World!</div>
      <Button onClick={() => console.log("Hello World!")}>Press ME!</Button>
    </>
  );
};

export default App;
