import Scene from "./Scene";
import TimeControls from "@/components/TimeControls";
import NowPanel from "@/components/NowPanel";

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      <Scene />
      <NowPanel />
      <TimeControls />
    </main>
  );
}