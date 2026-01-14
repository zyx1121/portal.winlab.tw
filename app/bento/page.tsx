export default function BentoPage() {
  return (
    <div className="w-full h-[calc(100dvh-4rem)]">
      <iframe
        src="https://bento.winlab.tw"
        className="w-full h-full border-0"
        title="Bento"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
