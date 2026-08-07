import { Countdown, EventDetails, LodgingSection } from "./details";
import { GiftListSection } from "./gifts";
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
      <GiftListSection />
      <Countdown />
    </SiteShell>
  );
}
