import { Countdown, EventDetails } from "./details";
import { HeroScene } from "./hero";
import { GuestMessages } from "./mural";
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
      <Countdown />
      <GuestMessages />
    </SiteShell>
  );
}
