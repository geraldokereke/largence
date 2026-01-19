import ScrollVelocity from "../ScrollVelocity";

export default function BeyondFeatures() {
  return (
    <section className="relative w-full py-36 flex flex-col items-center justify-center overflow-hidden gap-8">
      <ScrollVelocity
        texts={['AI-Powered Legal Analysis ◆', 'Instant Document Intelligence ◆']} 
        velocity={100}
        className="text-gradient-primary text-4xl md:text-5xl lg:text-6xl font-bold"
      />
    </section>
  );
}