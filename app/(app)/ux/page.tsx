"use client";

import React, { useState } from "react";
import {
  HeaderToolbar,
  LeftSidebar,
  RightSidebar,
  CameraControls,
  DashboardCard,
  Chat,
} from "@/components/panels";

const UXTestPage = () => {
  const [materialSelect, setMaterialSelect] = useState("dark-oak");
  const [widthValue, setWidthValue] = useState([60]);
  const [heightValue, setHeightValue] = useState([80]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background dark:bg-background">
      {/* Background with kitchen image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBzXzOFhRg9bPG0tibbJdH6nZ9O6S0rm4JBtOeT2zXME_I7OhoyZe8d9xUndm7DaqJgXMugIDdGkGR4Z4-liixDpiiviajyTZyYdzzskmL3pURVsy0pRNX6pU5nv3vS57YcQsVvnjSK4kkAVY5y2dZ5l_XF8YQjXnrFKomYUgzXRLd0LwGuRcjFCHhdHyjjs-ti7D4So0jmfgnuSxXQ9Z_FJJDYwYkRTkv8bAbcCgO9i_QZ0NN4AHADFqB77tWWzle3Sk0jXoByyoZI')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            alt="3D rendering of modern dark blue kitchen cabinets"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLFeFRcoE9YSJT-CodttLAsnkxdeBLTFSGdZ29AcHsfM4FkVLojEJCLi1S3eP-k2MuML4g5JgopBm1188M1QIbBE6BWKMecM-9oEHVGb68XK5B3WQD79q1F_5W3vQLcbG96BQ7e305coAwN5KyUKbUyLt9X7iBpDmNvp0ebYeEgFx2e0_rhd3XztOZAy1HBcYsdbzvDZmDKM6zpNKeRSQeTWOMN_9645IPdQp41toH8xL3xD7HBN-1tNlfMonYaCU3buriraVkN-NJ"
          />
        </div>
      </div>

      {/* Header Toolbar */}
      <HeaderToolbar />

      {/* Left Sidebar - Action Buttons */}
      <LeftSidebar />

      {/* Right Sidebar - Properties Panel */}
      <RightSidebar
        materialSelect={materialSelect}
        widthValue={widthValue}
        heightValue={heightValue}
        onMaterialChange={setMaterialSelect}
        onWidthChange={setWidthValue}
        onHeightChange={setHeightValue}
      />

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto flex flex-col items-end gap-4">
          {/* Dashboard Card */}
          <DashboardCard />

          {/* Chat Container */}
          <Chat />

          {/* Camera Controls */}
          <CameraControls />
        </div>
      </footer>
    </div>
  );
};

export default UXTestPage;
