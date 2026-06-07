import { Countdown, EventDetails } from "./details";
import { Confetti, CursorTrail, FloatingLanterns, ScrollThread, useReveal } from "./effects";
import { GiftSection } from "./gifts";
import { HeroScene, Navbar } from "./hero";
import { MusicPlayer } from "./music";
import { Footer, GuestMessages } from "./mural";
import { RSVPForm } from "./rsvp";
import { GallerySection } from "./story";
import { StorySection } from "./storybook";

export default function App() {
  useReveal();

  return (
    <>
      <div className="sky-backdrop" />
      <FloatingLanterns />
      <ScrollThread />
      <CursorTrail />
      <Confetti />

      <Navbar />
      <main>
        <HeroScene />
        <StorySection />
        <GallerySection />
        <EventDetails />
        <Countdown />
        <RSVPForm />
        <GiftSection />
        <GuestMessages />
      </main>
      <Footer />
      <MusicPlayer />
    </>
  );
}
