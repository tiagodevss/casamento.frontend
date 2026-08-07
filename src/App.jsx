import { Countdown, EventDetails, LodgingSection } from "./details";
import { HeroScene } from "./hero";
import { SiteShell } from "./SiteShell";
import { GallerySection } from "./story";
import { StorySection } from "./storybook";

export default function App() {
  return (
    <SiteShell>
      <HeroScene />
      <StorySection />
      <GallerySection />
      <EventDetails />
      <LodgingSection />
      <Countdown />
    </SiteShell>
  );
}
